export const successResponse = (data: any, statusCode = 200) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  },
  body: JSON.stringify(data)
});

export const errorResponse = (message: string, statusCode = 500, details?: any) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  },
  body: JSON.stringify({
    error: message,
    details,
    timestamp: new Date().toISOString()
  })
});
