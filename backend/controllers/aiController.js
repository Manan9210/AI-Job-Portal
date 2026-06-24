const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper: parse JSON from AI response (strip markdown code fences if present)
const parseJSON = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned);
};

// POST /api/ai/analyze-resume
const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is required (minimum 50 characters).' });
    }

    const prompt = `You are an expert resume reviewer and career coach. Analyze the following resume and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "strengths": [<3-5 string bullet points>],
  "weaknesses": [<2-4 string bullet points>],
  "suggestions": [<4-6 actionable string tips>],
  "missingKeywords": [<5-10 modern job market keywords missing from resume>],
  "summary": "<2-3 sentence overall assessment>"
}

Resume to analyze:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('analyzeResume error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned invalid response. Please try again.' });
    }
    res.status(500).json({ error: err.message || 'Resume analysis failed.' });
  }
};

// POST /api/ai/match-score
const getMatchScore = async (req, res) => {
  try {
    const { jobTitle, jobDescription, resumeText } = req.body;
    if (!jobTitle || !jobDescription || !resumeText) {
      return res.status(400).json({ error: 'jobTitle, jobDescription, and resumeText are required.' });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) and HR specialist. Compare this resume against the job posting and return ONLY a valid JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "matchedSkills": [<array of skills/keywords found in both job and resume>],
  "missingSkills": [<array of skills in job but NOT in resume>],
  "recommendation": "<clear 2-3 sentence recommendation on whether to apply and what to improve>",
  "keyInsights": [<exactly 3 string insights about the match>],
  "fitLevel": "<one of: Excellent Fit, Good Fit, Moderate Fit, Weak Fit>"
}

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Resume:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('getMatchScore error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned invalid response. Please try again.' });
    }
    res.status(500).json({ error: err.message || 'Match score calculation failed.' });
  }
};

// POST /api/ai/cover-letter
const generateCoverLetter = async (req, res) => {
  try {
    const { jobTitle, companyName, jobDescription, candidateName, skills } = req.body;
    if (!jobTitle || !companyName || !candidateName) {
      return res.status(400).json({ error: 'jobTitle, companyName, and candidateName are required.' });
    }

    const prompt = `You are a professional cover letter writer. Write a compelling, personalized cover letter for the following application. Return ONLY the cover letter text (no JSON, no markdown headers, just the letter content starting from "Dear Hiring Manager,").

Candidate Name: ${candidateName}
Job Title: ${jobTitle}
Company: ${companyName}
Candidate Skills: ${skills || 'Not specified'}
Job Description: ${jobDescription || 'Not provided'}

Write a professional cover letter with:
1. Opening paragraph: Express enthusiasm for the role and company
2. Middle paragraph(s): Highlight relevant skills and experiences that match the role
3. Closing paragraph: Call to action and professional sign-off

Keep it under 400 words. Be specific, confident, and professional.`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    res.json({ success: true, data: { coverLetter } });
  } catch (err) {
    console.error('generateCoverLetter error:', err);
    res.status(500).json({ error: err.message || 'Cover letter generation failed.' });
  }
};

// POST /api/ai/job-description
const generateJobDescription = async (req, res) => {
  try {
    const { jobTitle, companyName, requirements, experience } = req.body;
    if (!jobTitle || !companyName) {
      return res.status(400).json({ error: 'jobTitle and companyName are required.' });
    }

    const prompt = `You are an expert HR professional and job description writer. Create a complete, engaging, and inclusive job description. Return ONLY the job description text (no JSON, no markdown code blocks).

Job Title: ${jobTitle}
Company: ${companyName}
Experience Required: ${experience || 'Not specified'}
Key Requirements: ${requirements || 'Not specified'}

Write a full job description with these sections:
## About ${companyName}
(2-3 sentences about the company culture and mission)

## The Role
(2-3 sentences overview of the position)

## Key Responsibilities
(6-8 bullet points starting with action verbs)

## Requirements
(5-7 bullet points of required qualifications)

## Nice to Have
(3-4 bonus qualifications)

## What We Offer
(5-6 benefits and perks)

Make it engaging, inclusive, and professional.`;

    const result = await model.generateContent(prompt);
    const jobDescription = result.response.text().trim();

    res.json({ success: true, data: { jobDescription } });
  } catch (err) {
    console.error('generateJobDescription error:', err);
    res.status(500).json({ error: err.message || 'Job description generation failed.' });
  }
};

module.exports = { analyzeResume, getMatchScore, generateCoverLetter, generateJobDescription };
