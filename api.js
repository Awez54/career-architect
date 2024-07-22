import { GoogleGenerativeAI } from "@google/generative-ai";
import {filter,filter2} from "./filter.js";
import axios from 'axios';




// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyCIqCYoAO1qXIvf21lFJyKamYd_wZuK23w");

async function bard(user_text) {
  // For text-only input, use the gemini-pro model
 
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Given a block of text ${user_text} describing someone's skills for a job application, extract and rank only the skills explicitly mentioned in the text.includes both soft skills and technical skills mentioned in the given text . Rank the skills with soft skills appearing first. The output should be a simple list (array) containing only the extracted and ranked skill names.`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter(text)
}
async function job_d(user_text) {
 
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `give a brief discription about this task that are performed in ${user_text} profession in paragraph conating all aspects in about 50 words`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter(text)
}

async function resume(Experience,contactDetails,qualifications,skills) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Based on the information the user provides for their ${Experience} (job titles, companies, dates, responsibilities, achievements), ${contactDetails}(name, email, phone number, location - optional), ${qualifications}(degrees, institutions, graduation dates, relevant coursework - optional), and ${skills} (technical and soft skills), craft a professional resume  that will be accepted by ats and properly fromated Consistent Formatting: Ensure a clean, uniform look.Specific Keywords: Match job description terms precisely. Bullet Points: Use for responsibilities and achievements. Avoid Complex Elements: No tables, columns, or images also Detail in Summary: The summary could be enhanced with more specific achievements or experiences to include more relevant keywords.
  Experience Section: There's no mention of professional experience. If you have any, even internships or freelance work, include it.
  Consistency in Formatting: Ensure all elements are consistently formatted. For example, listing skills should be uniform across different sections.  for them.`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter2(text)
}

async function career1( user_interest,user_education ) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = ` A user is highly interested in learning about ${user_interest}. They are considering studying ${user_education} in college. Suggest relevant career paths that would allow them to explore this interest and potentially utilize the knowledge gained through their studies.your answer should be in de form for better understanding`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter2(text)
}
async function news(data) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `give me 6  latest trending news on ${data}`
  const result = await model.generateContent(prompt);
  const response = await result.response;
 
  return filter(response)
}

// salaryEstimation.js


async function Salary(d_job) {
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/estimated-salary',
    params: {
      job_title: `${d_job}`,
      location: 'India',
      radius: '100'
    },
    headers: {
      'X-RapidAPI-Key': '1ebdae4095msh61e5fbd9a30ed3ep180cc6jsn03596d20eeb6',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    throw error;
  }
}



export { bard,Salary,job_d,career1,resume, news}


