const SYSTEM_PROMPT = `You are a productivity assistant.
Return ONLY valid JSON.
No explanations.
No markdown code blocks.
No extra text before or after the JSON.
Allowed actions: create_habit, delete_habit, log_habit, add_task, complete_task, analyze_productivity, suggest_schedule.

Response format:
{
  "action": "<action_name>",
  "data": { ... }
}

Examples:
- "Create a workout habit" → {"action":"create_habit","data":{"name":"Workout","frequency":"daily"}}
- "Add task buy groceries with high priority" → {"action":"add_task","data":{"title":"Buy groceries","priority":"high"}}
- "Complete the task buy groceries" → {"action":"complete_task","data":{"title":"Buy groceries"}}
- "Log my meditation habit" → {"action":"log_habit","data":{"name":"Meditation"}}
- "Delete the workout habit" → {"action":"delete_habit","data":{"name":"Workout"}}
- "How am I doing?" → {"action":"analyze_productivity","data":{}}
- "Suggest a schedule" → {"action":"suggest_schedule","data":{}}`;

export async function parseAICommand(input) {
  const apiKey = localStorage.getItem('openai_api_key');

  if (!apiKey) {
    // Fallback: try to parse locally
    return parseLocally(input);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input },
        ],
        temperature: 0,
        max_tokens: 256,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.warn('OpenAI failed, trying local parse:', err.message);
    return parseLocally(input);
  }
}

function parseLocally(input) {
  const lower = input.toLowerCase().trim();

  // Create habit
  if (lower.match(/^(create|add|new|start)\s+(a\s+)?(habit|routine)\s*/i)) {
    const name = input.replace(/^(create|add|new|start)\s+(a\s+)?(habit|routine)\s*/i, '').trim();
    if (name) return { action: 'create_habit', data: { name, frequency: 'daily' } };
  }

  // Delete habit
  if (lower.match(/^(delete|remove|drop)\s+(the\s+)?(habit|routine)\s*/i)) {
    const name = input.replace(/^(delete|remove|drop)\s+(the\s+)?(habit|routine)\s*/i, '').trim();
    if (name) return { action: 'delete_habit', data: { name } };
  }

  // Log habit
  if (lower.match(/^(log|check|mark|done|complete)\s+(my\s+)?(habit\s+)?/i)) {
    const name = input.replace(/^(log|check|mark|done|complete)\s+(my\s+)?(habit\s+)?/i, '').trim();
    if (name) return { action: 'log_habit', data: { name } };
  }

  // Add task
  if (lower.match(/^(add|create|new)\s+(a\s+)?(task)\s*/i)) {
    const rest = input.replace(/^(add|create|new)\s+(a\s+)?(task)\s*/i, '').trim();
    let priority = 'medium';
    let title = rest;

    const prioMatch = rest.match(/\b(with|priority)\s+(high|medium|low)\s*(priority)?\b/i);
    if (prioMatch) {
      priority = prioMatch[2].toLowerCase();
      title = rest.replace(prioMatch[0], '').trim();
    }

    if (title) return { action: 'add_task', data: { title, priority } };
  }

  // Complete task
  if (lower.match(/^(complete|finish|done)\s+(the\s+)?(task)\s*/i)) {
    const title = input.replace(/^(complete|finish|done)\s+(the\s+)?(task)\s*/i, '').trim();
    if (title) return { action: 'complete_task', data: { title } };
  }

  // Analyze
  if (lower.match(/^(analyze|analysis|how|stats|productivity|report)/i)) {
    return { action: 'analyze_productivity', data: {} };
  }

  // Suggest schedule
  if (lower.match(/^(suggest|schedule|plan|recommend)/i)) {
    return { action: 'suggest_schedule', data: {} };
  }

  throw new Error('Could not understand command. Try: "create habit Reading" or "add task Buy groceries with high priority"');
}

export async function executeAIAction(parsed) {
  const response = await fetch('/api/ai/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to execute action');
  }

  return response.json();
}
