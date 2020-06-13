chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.contentScriptQuery == "fetchRedditUrl") {
      performRequest(request).then(res => sendResponse(res))
    }
    return true
  }
)

async function performRequest(request) {
  try {
    let response = await fetch(request.url, { mode: 'cors' })
    let body = await response.text()
    let parser = new DOMParser()
    let doc = parser.parseFromString(body, "text/html")
    let findDateResult = doc.evaluate("//a[@data-click-id='timestamp']", doc, null,
      XPathResult.ANY_TYPE, null)
    let dateElement = findDateResult.iterateNext()
    let findDescriptionResult = doc.evaluate("//meta[@property='og:description']", doc, null, 
      XPathResult.ANY_TYPE, null)
    let descriptionTag = findDescriptionResult.iterateNext()
    let votesCommentsRegex = /([0-9,]*) vote.* ([0-9,]*) comments/
    let findVotesComentsResult = votesCommentsRegex.exec(descriptionTag.getAttribute('content'))
    return {
      votes: findVotesComentsResult[1],
      comments: findVotesComentsResult[2],
      date: dateElement.text
    }
  } catch (error) {
    console.error(error)
    return {
      error: error
    }
  }
}