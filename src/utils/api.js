
// Get Azure Static Web Apps user info
export async function getUserInfo() {
  const response = await fetch('/.auth/me');
  const payload = await response.json();
  const { clientPrincipal } = payload;
  return clientPrincipal;
}

// Internal: Calls Azure OpenAI Chat API directly
// async function callAzureChatAPI(text) {
//   const endpoint =
//     "https://ai-aniruddhattu0077ai613245249477.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2023-03-15-preview";
//   const apiKey = process.env.REACT_APP_AI_SERVICE_API_KEY;

//   const body = {
//     messages: [{ role: "user", content: text }],
//     max_tokens: 4096,
//     temperature: 1.0,
//     model: "gpt-4o-mini"
//   };

//   try {
//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "api-key": apiKey
//       },
//       body: JSON.stringify(body)
//     });

//     if (!response.ok) throw new Error(`Server error: ${response.status}`);

//     const data = await response.json();
//     const apiReply = data.choices[0]?.message?.content || "No response from API";
//     return { reply: apiReply };
//   } catch (error) {
//     console.error("Azure Chat API failed:", error);
//     return { reply: "Error calling Azure Chat API." };
//   }
// }

// Internal: Calls middle-tier API
async function callMiddleTierChatApi(text) {
  try {
    console.log('Calling middle-tier API with text:', text);
    // URL of your middle-tier API.
    const response = await fetch(
      'https://chatapi20250405141607.azurewebsites.net/api/ChatAPI',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      }
    );

    if (!response.ok) {
      throw new Error('Middle-tier API response was not ok');
    }

    const data = await response.json();
    return { reply: data.reply || "No response from middle-tier API" };
  } catch (error) {
    console.error('Middle-tier API error:', error);
    return { reply: "Error calling middle-tier API." };
  }
}

// Public: Single wrapper to be used in App.js
export async function sendChatMessage(text) {
  // Toggle between APIs here
  return await callMiddleTierChatApi(text);
  // return await callAzureChatAPI(text);
}


export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://chatapi20250405141607.azurewebsites.net/api/UploadFile', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('File upload failed');
    return await response.json(); // should return { url: "https://..." }
  } catch (error) {
    console.error('File upload error:', error);
    return null;
  }
}

export async function deleteFile(filename) {
  try {
    const response = await fetch(`https://chatapi20250405141607.azurewebsites.net/api/DeleteFile/${filename}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('File delete failed');
    return true;
  } catch (error) {
    console.error('File delete error:', error);
    return false;
  }
}