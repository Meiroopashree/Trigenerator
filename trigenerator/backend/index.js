const express = require('express');

const cors = require('cors');

const axios = require('axios');

require('dotenv').config();

const app = express();

const PORT = 3001;

app.use(cors());

app.use(express.json());


// ✅ Axios instance for Mistral API

const axiosInstance = axios.create({

  timeout: 100000,

});

// ✅ Core function to call Mistral API

async function sendToAI(messages) {

  try {

    const response = await axiosInstance.post(

      "https://api.mistral.ai/v1/chat/completions",

      {

        model: "mistral-small-latest",

        temperature: 1.5,

        top_p: 1,

        max_tokens: 10000,

        messages: messages,

        response_format: { type: "text" },

      },

      {

        headers: {

          Authorization: `Bearer 6Z007kYgGg8YImWgAJUVK94UH66XyX5C`,

          "Content-Type": "application/json",

        },

      }

    );

    return response.data.choices[0].message.content;

  } catch (error) {

    console.error("❌ AI Request Failed:", error.response?.data || error.message);

    throw error;

  }

}

// ✅ Function to generate model suggestions based on selected collection

// ✅ Function to generate model suggestions based on selected collection
async function generateModelSuggestions(selectedCollection, selectedmethodType) {
  const prompt = `
  You are a .NET coding assistant. Generate 10 unique model class names that can be implemented using a ${selectedCollection} collection and based on the method ${selectedmethodType} in C#.
  Each model name should represent a real-world entity or use case that naturally fits the selected collection type's characteristics.
  Do NOT include the word "${selectedCollection}" or "List", "Set", "Unique", "Distinct" or "Collection" in the names. Just return clean, meaningful class names related to real-world use cases. 
  Avoid duplicates, and cover variety of real-world domains. I should have only 6 attributes in total. Provide the model names should and crisp.
  
  
  Return ONLY valid JSON like this:
  {
    "suggestions": [
      "Book",
      "Product",
      "Equipment",
      "Vehicle",
      "Shipment",
      "Appointment",
      "Device",
      "Order",
      "Patient",
      "Reservation"
      ...
    ]
  }
  `.trim();
  
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant that generates .NET model names based on collection type.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const aiResponse = await sendToAI(messages);

  // 🔧 Strip Markdown-style backticks (```json ... ```)
  const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleanedResponse);
    return parsed.suggestions;
  } catch (err) {
    console.error("⚠️ Failed to parse AI response as JSON:", cleanedResponse);
    throw new Error("AI returned malformed JSON.");
  }
}


// ✅ Route: POST /get-model-suggestions

app.post('/get-model-suggestions', async (req, res) => {

  const { selectedCollection, selectedmethodType  } = req.body;

  if (!selectedCollection || !selectedmethodType) {

    return res.status(400).json({ error: "Collection type is required." });

  }

  try {

    const suggestions = await generateModelSuggestions(selectedCollection, selectedmethodType );

    res.json({ suggestions });

  } catch (error) {

    res.status(500).json({ error: "Failed to generate model suggestions." });

  }

});


const fs = require('fs');
const path = require('path');

// ✅ Function to generate a question description
async function generateDescription(modelName, collectionType, methodType) {
  const templatePath = path.join(__dirname, 'description.txt');
  const template = fs.readFileSync(templatePath, 'utf-8');

  const prompt = `
  Using the structure below, generate a new question description based on the model name "${modelName}", method type "${methodType}", and collection type "${collectionType}".
  
  The model should include exactly 6 methods in total:
  - 1 method to add a new item
  - 1 method to get all items
  - 1 method to update an item (use a non-ID attribute for variation)
  - 1 method to delete an item (use a non-ID attribute for variation)
  - 1 additional method based on the selected method type: either 'Search', 'Sort', or 'Total'
  - 1 method to exit the program
  
  Only one of the additional functionalities should be included based on the value of "${methodType}". If method type is:
  - "Search" → include a method to search items by a specific string attribute
  - "Sort" → include a method to sort items by a specific property
  - "Total" → include a method that totals a specific numeric property in the collection
  
  Do not include more than 6 methods total.
  
  Use only one ID field in the model. Do not use TimeSpan or DateTime datatypes — only use int, string, and decimal.

${template}

Make sure the response includes a Title and a Description, and clearly states how the ${collectionType} should be used in the model.
`.trim();

  const messages = [
    {
      role: "system",
      content: "You are a .NET coding assistant that creates question descriptions based on model names and collection types.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await sendToAI(messages);
  return response;
}

app.post('/generate-description', async (req, res) => {
  const { modelName, collectionType, methodType } = req.body;

  if (!modelName || !collectionType || !methodType) {
    return res.status(400).json({ error: "Model name and collection type are required." });
  }

  try {
    const description = await generateDescription(modelName, collectionType, methodType);
    res.json({ description });
  } catch (error) {
    console.error("Failed to generate description:", error);
    res.status(500).json({ error: "Failed to generate description." });
  }
});


async function generateSolution(modelName, collectionType, description, methodType) {
  const solutionTemplatePath = path.join(__dirname, 'solution.txt');
  const solutionTemplate = fs.readFileSync(solutionTemplatePath, 'utf-8');

  const prompt = `
Using the model name "${modelName}", method type "${methodType}" and collection type "${collectionType}", and the following description. 
Other than the solution code don't provide any extra lines of sentences. The namspace should be dotnetapp and not the model names:

${description}

Write the implementation code that follows the structure and conventions below:
${solutionTemplate}

Ensure the solution includes all necessary logic relevant to the description and uses the ${collectionType} properly in the ${modelName} model.
  `.trim();

  const messages = [
    {
      role: "system",
      content: "You are a .NET developer assistant that generates solution code based on model requirements and templates.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await sendToAI(messages);
  return response;
}

app.post('/generate-solution', async (req, res) => {
  const { modelName, collectionType, description, methodType } = req.body;

  if (!modelName || !collectionType || !description ||!methodType) {
    return res.status(400).json({ error: "Model name, collection type, and description are required." });
  }

  try {
    const solution = await generateSolution(modelName, collectionType, description, methodType);
    res.json({ solution });
  } catch (error) {
    console.error("Solution generation error:", error);
    res.status(500).json({ error: "Failed to generate solution." });
  }
});


// ✅ Function to generate test cases
async function generateTestCases(solution, collectionType, methodType) {
  const testCaseTemplatePath = path.join(__dirname, 'testcase.txt');
  const testCaseTemplate = fs.readFileSync(testCaseTemplatePath, 'utf-8');

  const prompt = `
Based on the following model information:
Solution: ${solution}
Collection Type: ${collectionType}.
Method Type: ${methodType}
Using the format below:
${testCaseTemplate}

Generate appropriate test cases that validate the functionality, edge cases, and expected behaviors. Other than the testcase code don't provide any extra lines of sentences.
`.trim();

  const messages = [
    {
      role: "system",
      content: "You are a .NET unit test writer that generates test cases based on a given model and collection structure.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await sendToAI(messages);
  return response;
}


app.post('/generate-testcases', async (req, res) => {
  const { solution, collectionType, methodType } = req.body;

  if (!solution || !collectionType ||!methodType ) {
    return res.status(400).json({ error: "Solution, collection type are required." });
  }

  try {
    const testCases = await generateTestCases(solution, collectionType, methodType);
    res.json({ testCases });
  } catch (error) {
    console.error("Test case generation error:", error);
    res.status(500).json({ error: "Failed to generate test cases." });
    throw err;
  }
});


app.listen(PORT, () => {

  console.log(`🚀 Server running on http://localhost:${PORT}`);

});
