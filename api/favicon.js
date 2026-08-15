const ICON_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABlklEQVR42u2avU7DQAzHXSsLFTMSbAgkhg4d+wyIkSVMDKxdyso7lKVrZ7LwDMwZGbpRsfUJKlbYIgT5uOOCfTn/LWXIl5P/L87ZzmV0cHH1SYaNybgBAAAYt2zIN78+f2/cd/d26uRjNMQs0CbcFwSnLN7leE5ZvMt5nLr4rvPZgvg2P6gDrDz9Jn+IAABAKRxmH6+Fuoin65lOBMQgnojo5rmUBxAqfr/b0niaV4sWhOw/xe93W/FI6HodfjZHWYh4aYF9QTCbBepaY7Ys3gyAto8ibFl8L4XQUIUnHQGu4tELAIDiGLApVvRye1ytl8sFze4fbUTApljVbi+Xi/QBNInXgsAxideAwLGJl4aANAgAAAAAIjbJ517HSxVFohHgCkGyIhR/BbogSJfDKmNAEwSNXkCtGZrkczq6fKjWtSZZkAXwPSDADk/Ofm2LcbJEdAwYGhRvAONp7j1gSULxnWhliYvU2fcM0JfPv/gI+lU2lv8DQgCyxkVjER8cAagDAAAAAAAAAAAAAAAAAAAAAGCo9gVnkXzr2JufXwAAAABJRU5ErkJggg==';

export default function handler(request, response) {
  const image = Buffer.from(ICON_BASE64, 'base64');
  response.setHeader('Content-Type', 'image/png');
  response.setHeader('Content-Length', String(image.byteLength));
  response.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  return response.status(200).send(image);
}
