export const extractMainDomain = (url: string) => {
  const domainRegex =
    /^(?:https?:\/\/)?(?:.+\.)?([a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*(?:\.[a-z]{2,})?)(?:\/|$)/i;
  const localhostRegex = /^(?:https?:\/\/)?(localhost(?::\d+)?)/i;

  let match = url.match(domainRegex);
  if (match && match[1]) {
    return match[1];
  }

  match = url.match(localhostRegex);
  return match ? match[1] : url;
};
