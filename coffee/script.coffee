# Code Convetions

#---------------------------------------------------------------------------------------------------
# https://github.com/polarmobile/coffeescript-style-guide

#---------------------------------------------------------------------------------------------------

# Use spaces only, with 2 spaces per indentation level. Never mix tabs and spaces.

#---------------------------------------------------------------------------------------------------

# Always surround these binary operators with a single space on either side
# assignment: =
# augmented assignment: +=, -=, etc.
# comparisons: ==, <, >, <=, >=, unless, etc.
# arithmetic operators: +, -, *, /, etc.

#---------------------------------------------------------------------------------------------------

# Use camelCase (with a leading lowercase character) to name all variables, methods, and object properties.
# Use CamelCase (with a leading uppercase character) to name all classes.

#---------------------------------------------------------------------------------------------------

# When declaring a function that takes arguments, always use a single space after the closing parenthesis of the arguments list:
# foo = (arg1, arg2) -> # Yes
# foo = (arg1, arg2)-> # No

#---------------------------------------------------------------------------------------------------

# Take advantage of comprehensions whenever possible:

#   # Yes
#   result = (item.name for item in array)

#   # No
#   results = []
#   for item in array
#     results.push item.name

# To filter:

# result = (item for item in array when item.name is "test")

# To iterate over the keys and values of objects:

# object = one: 1, two: 2
# alert("#{key} = #{value}") for key, value of object

#---------------------------------------------------------------------------------------------------

# Annotation types:

#     TODO: describe missing functionality that should be added at a later date
#     FIXME: describe broken code that must be fixed
#     OPTIMIZE: describe code that is inefficient and may become a bottleneck
#     HACK: describe the use of a questionable (or ingenious) coding practice
#     REVIEW: describe code that should be reviewed to confirm implementation

#---------------------------------------------------------------------------------------------------

$ ->
  $(document).foundation()
  window.vm = new ViewModel()
  ko.applyBindings window.vm
  return

class BoardGameResult
  constructor: (data) ->
    @id = data.id
    @image = data.image
    @description = data.description
    @thumbnail = if $.type(data.thumbnail) is "object" then data.thumbnail.value else data.thumbnail
    @link = data.link
    @maxplayers = data.maxplayers
    @minage = data.minage
    @minplayers = data.minplayers
    @name = data.name
    @playingtime = data.playingtime
    @statistics = data.statistics
    @yearpublished = data.yearpublished
    @thumbnail ?= ""
    @hotRank = data.rank or data.hotRank

  # Returns all the ranks of a boardgame
  getRanks: ->
    @statistics.ratings.ranks.rank

  # Returns average rating of a boardgame
  getAverageRating: ->
    @statistics.ratings.average.value

  # Returns Bayes Rating of boardgame
  getBRating: ->
    @statistics.ratings.bayesaverage.value

  # Returns all the categories of a boardgame
  getCategories: ->
    # [Array]
    categories = []
    for link in @link
      categories.push(link["value"])  if link["type"] is "boardgamecategory"
    return categories

  # Returns the designer of a boardgame
  getDesigner: ->
    for link in @link
      return link["value"]  if link["type"] is "boardgamedesigner"
    return

  # Returns the primary name of a boardgame
  getName: ->
    return @name[0].value  if $.type(@name) is "array"
    @name.value

  # Returns shorted description of a boardgame
  getShortDescription: ->
    @description.slice(0, 100) + "..."

  # Returns the html of description string
  getHTMLDescription: ->
    paragraphs = 1
    contenthid = false

    regex = new RegExp("&#10;&#10;&#10;    ", "g")
    # [String]
    htmlDescription = @description.replace(regex, "<ul><li>")

    regex = new RegExp("&#10;&#10;&#10;", "g")
    htmlDescription = htmlDescription.replace(regex, "</li></ul>")

    regex = new RegExp("&#10;    ", "g")
    htmlDescription = htmlDescription.replace(regex, "</li><li>")

    htmlDescription = "<p>" + htmlDescription
 
    regex = new RegExp("&#10;&#10;", "g")
    htmlDescription = htmlDescription.replace(regex, "</p><p>")

    htmlDescription += "</p>"
    i = 0

    while i < htmlDescription.length
      # Count the number of paragraphs
      # Unordered lists count as paragraphs
      if htmlDescription.slice(i, i + 3) is "<p>" or htmlDescription.slice(i - 5, i) is "</ul>"
        paragraphs += 1
        # If past the defined limit of characters or paragraphs
        # hide the rest of the description
        if (paragraphs > 3 and i > 600 and htmlDescription.length - i > 7) and contenthid is false
          htmlDescription = htmlDescription.slice(0, i) + "<div class='full-description' style='display:none'>" + htmlDescription.slice(i, htmlDescription.length)
          contenthid = true
          break
      i++
    # Add a button to show the hidden part of the description
    htmlDescription += "</div><a onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down'></i></a>"  if contenthid
    regex = new RegExp(@getName(), "g")
    htmlDescription = htmlDescription.replace(regex, "<b>" + @getName() + "</b>")
    return htmlDescription


class BoardGame extends BoardGameResult
  constructor: (data) ->
    super(data)
    @comments = data.comments
    @commentsko = ko.observableArray([])
    @commentsData = 
      page:data.comments.page
      totalitems:data.comments.totalitems
    @commentsPage = ko.computed({
      read: =>
        @commentsData.page
      write: (value) =>
        vtw = parseInt(value)
        if 0 < vtw < @getCommentsTotalPages()+1
          @commentsData.page = vtw
          $ =>
            location.hash = "#game/#{@id}/comments/page/#{vtw}" if window.vm.currentPage() is "gameComments"
            return
        return
      }).extend({ notify: 'always' })
    @processComments()

    @goodComments ?= (comment for comment in @commentsko() when comment.value.length > 119 and parseInt(comment.rating) > 0 and comment.value.length < 600)
    @featuredComment = ko.observable()
    @pickFeaturedComment()
    # @commentsPage = ko.observable(@commentsData.page)
    # @commentsPage = ko.computed({
    #   read: =>
    #     @commentsData.page
    #   write: (value) =>
    #     console.log value
    #     #window.vm.getGameComments(@id, value)
    #     locaton.hash = "#game/#{@id}/comments/page/#{value}"
    #     return
    #   })

  processComments: =>
    data = @comments
    @commentsko(data.comment)
    @commentsPage(data.page)
    console.log @commentsPage()
  changePageBy: (num) =>
    @commentsPage(@commentsData.page + parseInt(num))
    console.log @commentsData

  # getComments: ->
  #   console.log "here"
  #   @comments.comment
  getCommentsTotalPages: ->
    Math.ceil(@commentsData.totalitems/100)

  pickFeaturedComment: ->
      @featuredComment(@goodComments[Math.floor(Math.random() * @goodComments.length)])
      return

  # Returns link to bgg rank page for given rank
  # @param name [String] type of rank/game
  # @param id [String] id of the rank
  # @param value [String] rank value
  getRankLink: (name, id, value) ->
    return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=#{id}&rank=#{value}##{value}"  if name is "boardgame"
    return "http://boardgamegeek.com/#{name}/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=#{id}&rank=#{value}##{value}"

  
class ViewModel
  constructor: ->
    self = this

    # Page
    @currentPage = ko.observable()
    @currentPageTitle = ko.computed(=>
      return switch @currentPage()
        when "searchGames" then 'Search Results'
        when "gameComments" then  'Game Comments'
        when "gameOverview" then 'Game Overview'
        when "hotGames" then 'Hot Games'
      )

    # [Array]
    @searchedGames = ko.observableArray([])
    # [Array]
    @hotGames = ko.observableArray([])
    # [BoardGame]
    @selectedGame = ko.observable()
    # Indicates that information is currently loading
    @loading = ko.observable(null)
    # 1 is ascending, -1 is descending
    @sortDirection = -1
    @currentSort = 'brating'
    # Client-side routes   
    Sammy(->
      @get "#search/:string", ->
        self.selectedGame null
        self.searchGames @params.string
        self.currentPage "searchGames"
        return

      @get "#game/:oid/comments/page/:num", ->
        self.getGameDetails(@params.oid, @params.num)
        self.currentPage "gameComments"
        #elf.getGameComments(@params.oid, @params.num)
        return

      @get /#game\/(.*)(#.+)?/, ->
        self.searchedGames.removeAll()
        self.getGameDetails @params.splat[0]
        self.currentPage "gameOverview"
        return

      @get "", ->
        this.title = "Hello"
        self.selectedGame null
        self.searchedGames.removeAll()
        self.getHotItems()
        self.currentPage "hotGames"
        return

      return
    ).run()

  goToGameComments: =>
    x = @selectedGame().commentsPage()
    location.hash = "game/#{@selectedGame().id}/comments/page/#{x}" 
    $("html, body").animate
          scrollTop: 0
        , "slow"
    return

  goToSearch: ->
    str = encodeURIComponent($("#search").val())
    location.hash = "search/" + str
    return
    
  # @param object [Object] boardgame object
  goToGame: (object) ->
    location.hash = "game/" + object.id
    $("html, body").animate
          scrollTop: 0
        , "slow"
    return

  # Sorting of search results by name/title
  # direction [Number] (1 is ascending, -1 is descending) OPTIONAL
  sortByName: (direction) ->
    @sortDirection = direction if direction?
    # a [BoardGameResult]
    # b [BoardGameResult]
    @searchedGames.sort (a, b) =>
      return 1 * @sortDirection  if a.getName() > b.getName()
      return -1 * @sortDirection  if a.getName() < b.getName()
      0

    return

  # Sorting of search results by bayes rating
  # direction [Number] (1 is ascending, -1 is descending) OPTIONAL
  sortByBRating: (direction) ->
    @sortDirection = direction if direction?
    @searchedGames.sort (a, b) =>
      return 1 * @sortDirection  if a.getBRating() > b.getBRating()
      return -1 * @sortDirection  if a.getBRating() < b.getBRating()
      0

    return
  # Invoked when user clicks on a table header of search results
  # Calls appropriate sort method 
  # Calls method to update icons representing sort direction
  # @param type [String] (name,brating)
  # @param vm [ViewModel]
  # @param event [jQueryEvent]
  handleSort: (type,vm,event) ->
    #default to descending sort
    #unless already sorted by the same type
    @sortDirection = if type is @currentSort then -(@sortDirection) else -1
    @currentSort = type
    @updateTableHeaders(type, event)
    switch type
      when "name" then @sortByName()
      when "brating" then @sortByBRating()
    return

  # Updates sort direction icons
  # @param type [String] (name,brating)
  # @param event [jQueryEvent]
  updateTableHeaders: (type,event) =>
    $("#results-table thead tr th").removeClass "headerSortUp"
    $("#results-table thead tr th").removeClass "headerSortDown"
    if @sortDirection is -1
      $(event.toElement).addClass "headerSortDown"
    else
      $(event.toElement).addClass "headerSortUp"
    return  

  # Searches games that match input string
  # @param str [String]
  searchGames: (str) ->
    # Clear previous search results
    @searchedGames.removeAll()
    # Do nothing if no characters are entered
    return  if str is ""

    regex = new RegExp(" ", "g")
    str = str.replace(regex, "+")

    @loading(true)

    # Check if results are already cached
    ids = @loadFromCache("searched_bgs_ids", str)
    if ids
      @loading null
      @getGamesDetails(ids, str)
      return

    url = "http://www.boardgamegeek.com/xmlapi/search?search=#{str}"
    $.getJSON @getYQLurl(url), (data) =>
      # [Array]
      ids = @extractIdsFromSearch(data)
      @saveToCache("searched_bgs_ids", str, ids)
      @getGamesDetails(ids, str)
      return

    return

  # Returns the list of ids of the boardgames that match the search string
  # @param data [Object]
  extractIdsFromSearch: (data) ->
    console.log data
    if data.query.results
      # [Array] or Object
      jdata = data.query.results.boardgames["boardgame"]
      # [Array]
      ids = []
      if Array.isArray(jdata)
        for object in jdata
          ids.push(object["objectid"])
      else
        ids.push(jdata["objectid"])
      return ids

  getSomething: ->
    console.log "here"
    url = "http://www.boardgamegeek.com/boardgame/125618/libertalia"
    $.getJSON "http://query.yahooapis.com/v1/public/yql?" + "q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(url) + "%22&format=xml'&callback=?", (data) ->
      console.log data
      return

    return

  # Returns the YQL query
  # @param str [String]
  getYQLurl: (str) ->
    q = "select * from xml where url="
    url = "'#{str}'"
    return "http://query.yahooapis.com/v1/public/yql?q=#{encodeURIComponent(q + url)}&format=json&callback=?"

  getHotItems: ->
    @loading(true)
    data = @loadFromCache("hot", "games")
    if data
      console.log data
      @hotGames((new BoardGameResult(result) for result in data))
      @loading(null)
      return
    url = "http://www.boardgamegeek.com/xmlapi2/hot?type=boardgame"
    $.getJSON @getYQLurl(url), (data) =>
      if data.query.results
        #console.log (new BoardGameResult(result) for result in data.query.results.items.item)
        @hotGames((new BoardGameResult(result) for result in data.query.results.items.item))
        @loading(null)
        @saveToCache("hot", "games", @hotGames())        
      return
    return

  # Loads data for a given boardgame id
  # @param id [String]
  getGameDetails: (id,page) ->
    @loading(true)
    if page
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=#{id}&stats=1&comments=1&pagesize=100&page=#{page}"
      $.getJSON @getYQLurl(url), (data) =>
        if data.query.results
          @selectedGame(new BoardGame(data.query.results.items["item"]))
          @loading(null)
        return
      return
    page ?= 1
    data = @loadFromCache("bg", id)
    if data
      @selectedGame(new BoardGame(data))
      @loading(null)
      return

    url = "http://www.boardgamegeek.com/xmlapi2/thing?id=#{id}&stats=1&comments=1&pagesize=100&page=#{page}"
    $.getJSON @getYQLurl(url), (data) =>
      if data.query.results
        @selectedGame(new BoardGame(data.query.results.items["item"]))
        @loading(null)
        @saveToCache("bg", id, @selectedGame())        
      return
    return

  getGamesDetails: (gameids, str) ->

    data = @loadFromCache("searched_bgs", str)
    if data
      console.log "using cached search games"
      @loading null
      @searchedGames((new BoardGameResult(result) for result in data))
      @sortByBRating(-1)
      return

    counter = 0
    i = 0

    while i < gameids.length
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + gameids[i] + "&stats=1"
      $.getJSON @getYQLurl(url), (data) =>
        counter += 1
        if data.query.results
          @searchedGames.push(new BoardGameResult(data.query.results.items["item"]))
        if counter is gameids.length
          @loading null
          @saveToCache("searched_bgs", str, @searchedGames()) 
          @sortByBRating(-1)
        return

      i++
    return

  saveToCache: (type,key,data) ->
    if Modernizr.sessionstorage
      sessionStorage["#{type}_#{key}"] = ko.toJSON(data)
    return
  loadFromCache: (type,key) ->
    if Modernizr.sessionstorage
      data = sessionStorage["#{type}_#{key}"]
      data = JSON.parse(data) if data
      return data
    return