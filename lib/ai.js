import crypto from 'crypto';
import { getCachedResponse, setCachedResponse } from './db.js';

let queuePromise = Promise.resolve();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function executeWithLimiter(actionId, actionFn, useCache = false) {
  const hash = crypto.createHash('md5').update(actionId).digest('hex');
  if (useCache) {
    const cached = getCachedResponse(hash);
    if (cached) return cached;
  }

  const myTurn = queuePromise.then(async () => {
    let maxRetries = 3;
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const text = await actionFn();
        if (useCache) setCachedResponse(hash, text);
        await sleep(1000); // reduced rate limiting sleep
        return text;
      } catch (error) {
        // Only retry on rate limits or server errors
        const shouldRetry = error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('500');
        if (attempt === maxRetries || !shouldRetry) {
          console.error(`AI Action failed after ${attempt} attempts:`, error.message);
          throw error;
        }
        console.warn(`AI Action attempt ${attempt} failed, retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2; 
      }
    }
  });

  queuePromise = myTurn.catch(() => {});
  return myTurn;
}

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing or undefined.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages
    })
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`Failed to parse AI response: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'Unknown Error';
    throw new Error(`AI API Error (${response.status}): ${errorMsg}`);
  }

  if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('AI API returned an empty or invalid response structure');
  }

  return data.choices[0].message.content;
}

export async function generateDocument(type, inputs, language = 'en') {
  const langInstruction = language === 'hi' 
    ? 'Generate the document in Hindi language.' 
    : 'Generate the document in English language.';

  const documentTemplates = {
    nda: `Generate a professional Non-Disclosure Agreement (NDA) with the following details:
- Disclosing Party: ${inputs.party1Name}
- Receiving Party: ${inputs.party2Name}
- Effective Date: ${inputs.effectiveDate}
- Duration: ${inputs.duration || '2 years'}
- Purpose: ${inputs.purpose || 'Business collaboration'}
- Jurisdiction: ${inputs.jurisdiction || 'India'}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    rental: `Generate a professional Rental/Lease Agreement with the following details:
- Landlord Name: ${inputs.landlordName}
- Tenant Name: ${inputs.tenantName}
- Property Address: ${inputs.propertyAddress}
- Monthly Rent: ${inputs.monthlyRent}
- Security Deposit: ${inputs.securityDeposit}
- Lease Start Date: ${inputs.startDate}
- Lease Duration: ${inputs.duration || '11 months'}
- Payment Due Date: ${inputs.paymentDueDate || '1st of each month'}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    employment: `Generate a professional Employment Contract with the following details:
- Employer Name/Company: ${inputs.employerName}
- Employee Name: ${inputs.employeeName}
- Position/Title: ${inputs.position}
- Start Date: ${inputs.startDate}
- Salary: ${inputs.salary}
- Work Location: ${inputs.workLocation || 'As assigned'}
- Probation Period: ${inputs.probationPeriod || '3 months'}
- Notice Period: ${inputs.noticePeriod || '30 days'}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    freelance: `Generate a professional Freelance Service Contract with the following details:
- Client Name: ${inputs.clientName}
- Freelancer Name: ${inputs.freelancerName}
- Scope of Work: ${inputs.scopeOfWork}
- Payment Terms: ${inputs.paymentTerms}
- Deadline: ${inputs.deadline}
- Jurisdiction: ${inputs.jurisdiction || 'India'}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    privacy: `Generate a professional Privacy Policy with the following details:
- Company/Website Name: ${inputs.companyName}
- Website URL: ${inputs.websiteURL}
- Types of Data Collected: ${inputs.dataTypes}
- Purpose of Collection: ${inputs.collectionPurpose}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    service: `Generate a professional Service Agreement with the following details:
- Provider Name: ${inputs.providerName}
- Client Name: ${inputs.clientName}
- Services Description: ${inputs.serviceDescription}
- Duration: ${inputs.duration}
- Fees: ${inputs.fees}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    terms: `Generate professional Terms and Conditions for a website or application with the following details:
- Company Name: ${inputs.companyName}
- Website/App Name: ${inputs.websiteName}
- Jurisdiction: ${inputs.jurisdiction || 'India'}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,

    loan: `Generate a professional Loan Agreement with the following details:
- Lender Name: ${inputs.lenderName}
- Borrower Name: ${inputs.borrowerName}
- Principal Amount: ${inputs.principalAmount}
- Interest Rate: ${inputs.interestRate}
- Repayment Schedule: ${inputs.repaymentSchedule}
${inputs.additionalTerms ? `- Additional Terms: ${inputs.additionalTerms}` : ''}`,
  };

  const systemInstructions = `You are an expert legal document drafter. ${langInstruction}
Requirements:
- Use professional legal language that is still accessible
- Include all standard clauses for this type of document
- Include proper sections with numbering
- Add signature blocks at the end
- Include date and place fields
- Make it comprehensive yet clear

IMPORTANT: Add a disclaimer at the very end: "DISCLAIMER: This document is generated by AI for informational purposes only. It is not a substitute for professional legal advice."`;

  const userPrompt = `${documentTemplates[type] || documentTemplates.nda}\n\nGenerate the complete document now:`;
  const cacheKey = systemInstructions + userPrompt;

  return await executeWithLimiter(cacheKey, async () => {
    return await callGroq([
      { role: 'system', "content": systemInstructions },
      { role: 'user', "content": userPrompt }
    ]);
  }, true);
}

export async function simplifyDocument(text, language = 'en') {
  const langInstruction = language === 'hi'
    ? 'Provide the output in Hindi language.'
    : 'Provide the output in English language.';

  const systemInstructions = `You are a legal document simplifier. ${langInstruction}

Analyze the legal document and provide:
1. **Document Summary**: 2-3 sentence overview.
2. **Key Points**: List most important terms in simple language.
3. **Important Dates & Numbers**: Extract deadlines or financial terms.
4. **What You're Agreeing To**: Explain in plain language.
5. **Potential Concerns**: Highlight any disadvantageous terms.`;

  const userPrompt = `Here is the legal document:\n---\n${text}\n---\n\nPlease provide a clear, easy-to-understand analysis:`;
  const cacheKey = systemInstructions + userPrompt;

  return await executeWithLimiter(cacheKey, async () => {
    return await callGroq([
      { role: 'system', "content": systemInstructions },
      { role: 'user', "content": userPrompt }
    ]);
  }, true);
}

export async function explainClause(clause, language = 'en') {
  const langInstruction = language === 'hi'
    ? 'Provide the explanation in Hindi language.'
    : 'Provide the explanation in English language.';

  const systemInstructions = `You are a legal expert who explains complex legal clauses to non-lawyers. ${langInstruction}

Analyze the legal clause and provide:
1. **Plain Language Explanation**: What does it mean?
2. **Why It's Included**: Purpose?
3. **Your Rights**: Rights/Obligations?
4. **Potential Risks**: ⚠️ Downsides?
5. **Things to Watch Out For**: Red flags?
6. **Common Modifications**: How can it be fairer?`;

  const userPrompt = `Legal Clause:\n---\n${clause}\n---\n\nProvide a thorough but easy-to-understand explanation:`;
  const cacheKey = systemInstructions + userPrompt;

  return await executeWithLimiter(cacheKey, async () => {
    return await callGroq([
      { role: 'system', "content": systemInstructions },
      { role: 'user', "content": userPrompt }
    ]);
  }, true);
}

export async function chatResponse(messages) {
  const systemPrompt = `You are LegalAI Assistant, a helpful and knowledgeable legal assistant designed for beginners and small businesses. 
Your guidelines:
- Explain legal concepts in simple, easy-to-understand language
- Be helpful and friendly, avoiding unnecessary legal jargon
- Mention relevant jurisdiction (default India)
- Remind users advice is informational
- Use bullet points and formatting
- Redir non-legal topics back to legal`;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  const cacheKey = formattedMessages.map(m => m.role + m.content).join('|');
  
  return await executeWithLimiter(cacheKey, async () => {
    return await callGroq(formattedMessages);
  }, false);
}

export async function checkCompliance(text) {
  const systemInstructions = `You are an expert legal compliance analyzer. Provide detailed compliance report.

Return analysis in following pure JSON format ONLY:
{
  "riskScore": "low|medium|high",
  "riskPercentage": 50,
  "summary": "assessment",
  "missingClauses": [{"clause": "name", "importance": "critical", "description": "why"}],
  "riskyTerms": [{"term": "quote", "risk": "high", "explanation": "why"}],
  "strengths": ["good points"],
  "recommendations": ["suggestion"]
}`;

  const userPrompt = `Legal Document:\n---\n${text}\n---\n\nAnalyze and return ONLY valid JSON:`;
  const cacheKey = systemInstructions + userPrompt;

  let responseText = await executeWithLimiter(cacheKey, async () => {
    return await callGroq([
      { role: 'system', "content": systemInstructions },
      { role: 'user', "content": userPrompt }
    ]);
  }, true);

  responseText = responseText.trim();
  if (responseText.startsWith('\`\`\`')) {
    responseText = responseText.replace(/\`\`\`json?\\n?/g, '').replace(/\`\`\`$/g, '').trim();
  }
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return {
      riskScore: 'medium',
      riskPercentage: 50,
      summary: 'Analysis completed with partial results. Please review manually.',
      missingClauses: [],
      riskyTerms: [],
      strengths: ['Document submitted'],
      recommendations: ['Consider professional review'],
      rawAnalysis: responseText,
    };
  }
}
