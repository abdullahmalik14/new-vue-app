export async function fetchMockAnalytics() {
  // simulate delay
  await new Promise(res => setTimeout(res, 500))

  const response = await fetch('/mock/analytics.json') 
  return response.json()
}