/**
 * Stream chat responses from the server using Server-Sent Events
 * @param {string} message - User message
 * @param {array} models - Selected models
 * @param {function} onModelResponse - Callback when a model response arrives
 * @param {function} onSynthesis - Callback when synthesis response arrives
 * @param {function} onDone - Callback when stream is complete
 * @param {function} onError - Callback on error
 */
export async function streamChat(
  message,
  models,
  onModelResponse,
  onSynthesis,
  onDone,
  onError,
  signal
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        models,
        synthesize: true, // Set to false to skip synthesis for faster response
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Process complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);
            console.log('[DEBUG streamChat] Received event type:', event.type, 'data length:', event.data ? JSON.stringify(event.data).length : 'null');

            if (event.type === 'model_response') {
              console.log('[DEBUG streamChat] Model response:', event.data.model);
              onModelResponse(event.data);
            } else if (event.type === 'synthesis') {
              console.log('[DEBUG streamChat] Synthesis event received, response length:', event.data.response ? event.data.response.length : 'null');
              console.log('[DEBUG streamChat] Synthesis first 200 chars:', event.data.response ? event.data.response.substring(0, 200) : 'null');
              onSynthesis(event.data);
            } else if (event.type === 'done') {
              console.log('[DEBUG streamChat] Done event received');
              onDone();
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e, 'line was:', line);
          }
        }
      }

      // Keep incomplete line in buffer
      buffer = lines[lines.length - 1];
    }
  } catch (error) {
    console.error('Stream chat error:', error);
    onError(error);
  }
}
