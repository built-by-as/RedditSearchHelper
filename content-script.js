function enrichSearchResults(contextNode = document) {
  var googleSearchLinks = document.evaluate("//div[@class=\"g\"]//a[starts-with(@href, 'https://www.reddit.com') and not(@rsh-processed)]", 
  contextNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)

  for ( let i = 0; i < googleSearchLinks.snapshotLength; i++) {
    let link = googleSearchLinks.snapshotItem(i).getAttribute('href')
    googleSearchLinks.snapshotItem(i).setAttribute('rsh-processed', true)
    if (link.includes('/comments/')) {
      chrome.runtime.sendMessage({contentScriptQuery: "fetchRedditUrl", url: link}, function(response) {
        if (response.error) return
        var redditInfo = document.createElement('div')
        redditInfo.setAttribute("class", "rsh-wrapper")

        function addIconAndText(iconPath, text) {
          var icon = document.createElement('img')
          icon.setAttribute("class", "rsh-icon")
          icon.setAttribute('src', chrome.extension.getURL(iconPath))
          redditInfo.append(icon)
          let textElement = document.createElement('span')
          textElement.textContent = text
          textElement.setAttribute("class", "rsh-text")
          redditInfo.append(textElement)
        }
        
        addIconAndText('assets/calendar_icon.png', response.date)
        addIconAndText('assets/upvote_arrow.png', response.votes)
        addIconAndText('assets/comment_icon.png', response.comments)

        googleSearchLinks.snapshotItem(i).insertAdjacentElement('afterend', redditInfo)
      })
    }
  }
}

enrichSearchResults()

let additionalSearchResultsElement = document.getElementById("extrares")
let observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    let targetId = mutation.target.getAttribute("id")
    if (targetId && targetId.startsWith("arc-srp")) {
      for (let addedNode of mutation.addedNodes) {
        enrichSearchResults(addedNode)
      }
    }
  })
})

observer.observe(additionalSearchResultsElement, { childList: true, subtree: true })