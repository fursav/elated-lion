(function() {
  var BoardGame, BoardGameResult, ViewModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $(function() {
    var nav;
    nav = responsiveNav(".nav-collapse", {
      animate: true,
      transition: 284,
      label: ""
    });
    $("#nav").onePageNav({
      currentClass: "active"
    });
    window.vm = new ViewModel();
    ko.applyBindings(window.vm);
  });

  BoardGameResult = (function() {
    function BoardGameResult(data) {
      this.id = data.id;
      this.image = data.image || "";
      this.description = data.description;
      this.thumbnail = $.type(data.thumbnail) === "object" ? data.thumbnail.value : data.thumbnail;
      this.link = data.link;
      this.maxplayers = data.maxplayers;
      this.minage = data.minage;
      this.minplayers = data.minplayers;
      this.name = data.name;
      this.playingtime = data.playingtime;
      this.statistics = data.statistics;
      this.yearpublished = data.yearpublished || "";
      if (this.thumbnail == null) {
        this.thumbnail = "";
      }
      this.hotRank = data.rank || data.hotRank;
    }

    BoardGameResult.prototype.getRanks = function() {
      return this.statistics.ratings.ranks.rank;
    };

    BoardGameResult.prototype.getRank = function(name) {
      var rank, _i, _len, _ref, _results;
      _ref = this.getRanks();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rank = _ref[_i];
        if (rank.name === name) {
          _results.push(rank.value);
        }
      }
      return _results;
    };

    BoardGameResult.prototype.getTopRank = function() {
      var rank, _i, _len, _ref, _results;
      _ref = this.getRanks();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rank = _ref[_i];
        if (rank.name === "boardgame") {
          _results.push(parseInt(rank.value));
        }
      }
      return _results;
    };

    BoardGameResult.prototype.getAverageRating = function() {
      return this.statistics.ratings.average.value;
    };

    BoardGameResult.prototype.getBRating = function() {
      return this.statistics.ratings.bayesaverage.value;
    };

    BoardGameResult.prototype.getCategories = function() {
      var categories, link, _i, _len, _ref;
      categories = [];
      _ref = this.link;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link["type"] === "boardgamecategory") {
          categories.push(link["value"]);
        }
      }
      return categories;
    };

    BoardGameResult.prototype.getDesigner = function() {
      var link, _i, _len, _ref;
      _ref = this.link;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link["type"] === "boardgamedesigner") {
          return link["value"];
        }
      }
    };

    BoardGameResult.prototype.getName = function() {
      if ($.type(this.name) === "array") {
        return this.name[0].value;
      }
      return this.name.value;
    };

    BoardGameResult.prototype.getShortDescription = function() {
      return this.description.slice(0, 100) + "...";
    };

    BoardGameResult.prototype.getHTMLDescription = function() {
      var contenthid, htmlDescription, i, paragraphs, regex;
      paragraphs = 1;
      contenthid = false;
      console.log(this.description);
      regex = new RegExp("&amp;&amp;#35;", "g");
      htmlDescription = this.description.replace(regex, "&#");
      console.log(htmlDescription);
      regex = new RegExp("&#10;&#10;&#10;    ", "g");
      htmlDescription = htmlDescription.replace(regex, "<ul><li>");
      regex = new RegExp("&#10;&#10;&#10;", "g");
      htmlDescription = htmlDescription.replace(regex, "</li></ul>");
      regex = new RegExp("&#10;    ", "g");
      htmlDescription = htmlDescription.replace(regex, "</li><li>");
      htmlDescription = "<p>" + htmlDescription;
      regex = new RegExp("&#10;&#10;", "g");
      htmlDescription = htmlDescription.replace(regex, "</p><p>");
      regex = new RegExp("&amp;quot;", "g");
      htmlDescription = htmlDescription.replace(regex, '"');
      htmlDescription += "</p>";
      i = 0;
      while (i < htmlDescription.length) {
        if (htmlDescription.slice(i, i + 3) === "<p>" || htmlDescription.slice(i - 5, i) === "</ul>") {
          paragraphs += 1;
          if ((paragraphs > 3 && i > 600 && htmlDescription.length - i > 7) && contenthid === false) {
            htmlDescription = htmlDescription.slice(0, i) + "<div class='full-description' style='display:none'>" + htmlDescription.slice(i, htmlDescription.length);
            contenthid = true;
            break;
          }
        }
        i++;
      }
      if (contenthid) {
        htmlDescription += "</div><button class='link link-wide' onclick=$('.full-description').toggle(function(){$('.show-more').toggleClass('ion-chevron-up')});><i class='show-more icon ion-chevron-down'></i></button>";
      }
      regex = new RegExp(this.getName(), "g");
      htmlDescription = htmlDescription.replace(regex, "<b>" + this.getName() + "</b>");
      return htmlDescription;
    };

    return BoardGameResult;

  })();

  BoardGame = (function(_super) {
    __extends(BoardGame, _super);

    function BoardGame(data) {
      this.changePageBy = __bind(this.changePageBy, this);
      this.processComments = __bind(this.processComments, this);
      var comment;
      BoardGame.__super__.constructor.call(this, data);
      this.comments = {};
      this.commentsko = ko.observableArray([]);
      this.commentsData = {};
      console.log(data);
      if (data.comments != null) {
        this.comments = data.comments;
        this.commentsData = {
          page: data.comments.page,
          totalitems: data.comments.totalitems
        };
        this.commentsPage = ko.computed({
          read: (function(_this) {
            return function() {
              return _this.commentsData.page;
            };
          })(this),
          write: (function(_this) {
            return function(value) {
              var vtw;
              vtw = parseInt(value);
              console.log(vtw);
              if ((0 < vtw && vtw < _this.getCommentsTotalPages() + 1)) {
                _this.commentsData.page = vtw;
                $(function() {
                  if (window.vm.currentPage() === "gameComments") {
                    location.hash = "#game/" + _this.id + "/comments/page/" + vtw;
                  }
                });
              }
            };
          })(this)
        }).extend({
          notify: 'always'
        });
        this.processComments();
      } else {
        this.commentsPage = ko.observable();
      }
      if (this.goodComments == null) {
        this.goodComments = (function() {
          var _i, _len, _ref, _results;
          _ref = this.commentsko();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            comment = _ref[_i];
            if (comment.value.length > 119 && parseInt(comment.rating) > 0 && comment.value.length < 600) {
              _results.push(comment);
            }
          }
          return _results;
        }).call(this);
      }
      this.featuredComment = ko.observable();
      this.pickFeaturedComment();
    }

    BoardGame.prototype.processComments = function() {
      var data;
      data = this.comments;
      this.commentsko(data.comment);
      this.commentsPage(data.page);
      return console.log(this.commentsPage());
    };

    BoardGame.prototype.changePageBy = function(num) {
      this.commentsPage(this.commentsData.page + parseInt(num));
      return console.log(this.commentsData);
    };

    BoardGame.prototype.getCommentsTotalPages = function() {
      return Math.ceil(this.commentsData.totalitems / 100);
    };

    BoardGame.prototype.pickFeaturedComment = function() {
      this.featuredComment(this.goodComments[Math.floor(Math.random() * this.goodComments.length)]);
      return false;
    };

    BoardGame.prototype.getRankLink = function(name, id, value) {
      if (name === "boardgame") {
        return "http://boardgamegeek.com/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
      }
      return "http://boardgamegeek.com/" + name + "/browse/boardgame?sort=rank&rankobjecttype=subtype&rankobjectid=" + id + "&rank=" + value + "#" + value;
    };

    return BoardGame;

  })(BoardGameResult);

  ViewModel = (function() {
    function ViewModel() {
      this.updateTableHeaders = __bind(this.updateTableHeaders, this);
      this.goToGame = __bind(this.goToGame, this);
      this.goToGameComments = __bind(this.goToGameComments, this);
      var self;
      self = this;
      this.loading = ko.observable(null);
      this.sortDirection = -1;
      this.currentSort = 'brating';
      this.gameTypes = [
        {
          key: 'boardgame',
          name: "Overall"
        }, {
          key: 'partygames',
          name: 'Party'
        }, {
          key: 'abstracts',
          name: 'Abstract'
        }, {
          key: 'cgs',
          name: 'Customizable'
        }, {
          key: 'childrensgames',
          name: "Children"
        }, {
          key: 'familygames',
          name: 'Family'
        }, {
          key: 'strategygames',
          name: 'Strategy'
        }, {
          key: 'thematic',
          name: 'Thematic'
        }, {
          key: 'wargames',
          name: 'War'
        }
      ];
      this.currentPage = ko.observable();
      this.currentPageTitle = ko.computed((function(_this) {
        return function() {
          switch (_this.currentPage()) {
            case "searchGames":
              return 'Search Results';
            case "gameComments":
              return 'Game Comments';
            case "gameOverview":
              return 'Game Overview';
            case "hotGames":
              return 'Hot Games';
            case "topGames":
              return 'Top Games';
          }
        };
      })(this));
      this.searchedGames = ko.observableArray([]);
      this.hotGames = ko.observableArray([]);
      this.topGamesType = ko.observable();
      this.topGames = ko.observableArray([]);
      this.dataTimeStamp = ko.observable();
      $.getJSON('json/top100.json', (function(_this) {
        return function(data) {
          return _this.dataTimeStamp(data.date);
        };
      })(this));
      this.selectedGame = ko.observable();
      Sammy(function() {
        this.get(/#search\/(\w*)/, function() {
          self.selectedGame(null);
          self.searchGames(this.params.splat[0]);
          self.currentPage("searchGames");
        });
        this.get(/#game\/(\w*)$/, function() {
          self.currentPage("gameOverview");
          self.searchedGames.removeAll();
          self.getGameDetails(this.params.splat[0]);
        });
        this.get(/#game\/(\w*)\/comments\/page\/(\w*)/, function() {
          self.getGameDetails(this.params.splat[0], this.params.splat[1]);
          self.currentPage("gameComments");
        });
        this.get("#topgames/:gameType", function() {
          self.topGamesType(this.params.gameType);
          console.log(self.topGamesType());
          self.selectedGame(null);
          self.searchedGames.removeAll();
          self.topGames.removeAll();
          self.getTopGames(this.params.gameType);
          self.currentPage("topGames");
        });
        this.get("", function() {
          console.log("as");
          this.title = "Hello";
          self.selectedGame(null);
          self.searchedGames.removeAll();
          self.getHotItems();
          self.currentPage("hotGames");
        });
        this.get("/", function() {
          console.log("dead");
        });
      }).run();
    }

    ViewModel.prototype.goToGameComments = function() {
      var x;
      x = this.selectedGame().commentsPage();
      location.hash = "game/" + (this.selectedGame().id) + "/comments/page/" + x;
      $("html, body").animate({
        scrollTop: 0
      }, "slow");
    };

    ViewModel.prototype.goToSearch = function() {
      var str;
      str = encodeURIComponent($("#search").val());
      location.hash = "search/" + str;
    };

    ViewModel.prototype.goToGame = function(object) {
      console.log(object);
      location.hash = "game/" + object.id;
      $("html, body").animate({
        scrollTop: 0
      }, "slow");
    };

    ViewModel.prototype.sortList = function(list, type) {
      return list.sort((function(_this) {
        return function(a, b) {
          var a_prop, b_prop;
          a_prop = parseInt(a.getRank(type));
          b_prop = parseInt(b.getRank(type));
          if (a_prop > b_prop) {
            return 1;
          }
          if (a_prop < b_prop) {
            return -1;
          }
          return 0;
        };
      })(this));
    };

    ViewModel.prototype.sortByName = function(direction) {
      if (direction != null) {
        this.sortDirection = direction;
      }
      this.searchedGames.sort((function(_this) {
        return function(a, b) {
          if (a.getName() > b.getName()) {
            return 1 * _this.sortDirection;
          }
          if (a.getName() < b.getName()) {
            return -1 * _this.sortDirection;
          }
          return 0;
        };
      })(this));
    };

    ViewModel.prototype.sortByBRating = function(direction) {
      if (direction != null) {
        this.sortDirection = direction;
      }
      this.searchedGames.sort((function(_this) {
        return function(a, b) {
          if (a.getBRating() > b.getBRating()) {
            return 1 * _this.sortDirection;
          }
          if (a.getBRating() < b.getBRating()) {
            return -1 * _this.sortDirection;
          }
          return 0;
        };
      })(this));
    };

    ViewModel.prototype.handleSort = function(type, vm, event) {
      console.log([type, vm, event]);
      this.sortDirection = type === this.currentSort ? -this.sortDirection : -1;
      this.currentSort = type;
      this.updateTableHeaders(type, event);
      switch (type) {
        case "name":
          this.sortByName();
          break;
        case "brating":
          this.sortByBRating();
      }
    };

    ViewModel.prototype.updateTableHeaders = function(type, event) {
      $("#results-table thead tr th").removeClass("headerSortUp");
      $("#results-table thead tr th").removeClass("headerSortDown");
      if (this.sortDirection === -1) {
        $(event.toElement).addClass("headerSortDown");
      } else {
        $(event.toElement).addClass("headerSortUp");
      }
    };

    ViewModel.prototype.searchGames = function(str) {
      var ids, regex, url;
      this.searchedGames.removeAll();
      if (str === "") {
        return;
      }
      regex = new RegExp(" ", "g");
      str = str.replace(regex, "+");
      str = encodeURI(str);
      this.loading(true);
      ids = this.loadFromCache("searched_bgs_ids", str);
      console.log("ids");
      if (ids) {
        this.loading(null);
        this.getGamesDetails(ids, str);
        return;
      }
      url = "http://www.boardgamegeek.com/xmlapi/search?search=" + str;
      $.getJSON("/search/" + str, (function(_this) {
        return function(data) {
          ids = _this.extractIdsFromSearch(data);
          _this.saveToCache("searched_bgs_ids", str, ids);
          _this.getGamesDetails(ids, str);
        };
      })(this));
    };

    ViewModel.prototype.extractIdsFromSearch = function(data) {
      var ids, jdata, object, _i, _len;
      console.log(data);
      if (data) {
        jdata = data.boardgames["boardgame"];
        ids = [];
        if (Array.isArray(jdata)) {
          for (_i = 0, _len = jdata.length; _i < _len; _i++) {
            object = jdata[_i];
            ids.push(object["objectid"]);
          }
        } else {
          ids.push(jdata["objectid"]);
        }
        return ids;
      }
    };

    ViewModel.prototype.getYQLurl = function(str) {
      var q, url;
      q = "select * from xml where url=";
      url = "'" + str + "'";
      return "http://query.yahooapis.com/v1/public/yql?q=" + (encodeURIComponent(q + url)) + "&format=json&callback=?";
    };

    ViewModel.prototype.getTopGames = function(type) {
      this.loading(true);
      $.getJSON('json/top100.json', (function(_this) {
        return function(data) {
          var bgdata, counter, id, items, url, _i, _len, _results;
          console.log(data);
          items = data[type];
          counter = 0;
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            id = items[_i];
            bgdata = _this.loadFromCache("bgr", id);
            if (bgdata) {
              counter += 1;
              _this.topGames.push(new BoardGameResult(bgdata));
              if (counter === items.length) {
                console.log(_this.topGames());
                _results.push(_this.loading(null));
              } else {
                _results.push(void 0);
              }
            } else {
              url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1";
              _results.push($.getJSON("/bgr/" + id, function(data) {
                var bgr;
                counter += 1;
                if (data) {
                  bgr = new BoardGameResult(data.items["item"]);
                  _this.topGames.push(bgr);
                  _this.saveToCache("bgr", bgr.id, bgr);
                }
                if (counter === items.length) {
                  _this.sortList(_this.topGames, _this.topGamesType());
                  _this.loading(null);
                }
              }));
            }
          }
          return _results;
        };
      })(this));
    };

    ViewModel.prototype.getHotItems = function() {
      var data, result, url;
      console.log("hot");
      this.loading(true);
      data = this.loadFromCache("hot", "games");
      if (data) {
        console.log(data);
        this.hotGames((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            result = data[_i];
            _results.push(new BoardGameResult(result));
          }
          return _results;
        })());
        this.loading(null);
        return;
      }
      url = "http://www.boardgamegeek.com/xmlapi2/hot?type=boardgame";
      console.log("hot");
      $.getJSON('data', url, (function(_this) {
        return function(data) {
          console.log("got it");
          console.log(data);
          if (data) {
            _this.hotGames((function() {
              var _i, _len, _ref, _results;
              _ref = data.items.item;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                result = _ref[_i];
                _results.push(new BoardGameResult(result));
              }
              return _results;
            })());
            _this.loading(null);
            _this.saveToCache("hot", "games", _this.hotGames());
          }
        };
      })(this));
    };

    ViewModel.prototype.getGameDetails = function(id, page) {
      var data, url;
      this.loading(true);
      if (page) {
        url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1&pagesize=100&page=" + page;
        $.getJSON("bg/" + id + "/" + page, (function(_this) {
          return function(data) {
            var subnav;
            if (data) {
              _this.selectedGame(new BoardGame(data.items["item"]));
              _this.loading(null);
              subnav = $('#sub-nav').onePageNav({
                currentClass: 'active'
              });
            }
          };
        })(this));
        return;
      }
      if (page == null) {
        page = 1;
      }
      data = this.loadFromCache("bg", id);
      if (data) {
        this.selectedGame(new BoardGame(data));
        this.loading(null);
        return;
      }
      url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + id + "&stats=1&comments=1&pagesize=100&page=" + page;
      $.getJSON("/bg/" + id, (function(_this) {
        return function(data) {
          var subnav;
          if (data) {
            _this.selectedGame(new BoardGame(data.items["item"]));
            _this.loading(null);
            subnav = $('#sub-nav').onePageNav({
              currentClass: 'active'
            });
            _this.saveToCache("bg", {
              'query': id
            }, _this.selectedGame());
          }
        };
      })(this));
    };

    ViewModel.prototype.getGamesDetails = function(gameids, str) {
      var counter, data, i, result, url;
      data = this.loadFromCache("searched_bgs", str);
      if (data) {
        console.log("using cached search games");
        this.loading(null);
        this.searchedGames((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            result = data[_i];
            _results.push(new BoardGameResult(result));
          }
          return _results;
        })());
        this.sortByBRating(-1);
        return;
      }
      counter = 0;
      i = 0;
      while (i < gameids.length) {
        url = "http://www.boardgamegeek.com/xmlapi2/thing?id=" + gameids[i] + "&stats=1";
        $.getJSON("/bgr/" + gameids[i], (function(_this) {
          return function(data) {
            counter += 1;
            if (data) {
              _this.searchedGames.push(new BoardGameResult(data.items["item"]));
            }
            if (counter === gameids.length) {
              _this.loading(null);
              _this.saveToCache("searched_bgs", str, _this.searchedGames());
              _this.sortByBRating(-1);
            }
          };
        })(this));
        i++;
      }
    };

    ViewModel.prototype.saveToCache = function(type, key, data) {
      if (Modernizr.sessionstorage) {
        sessionStorage["" + type + "_" + key] = ko.toJSON(data);
      }
    };

    ViewModel.prototype.loadFromCache = function(type, key) {
      var data;
      if (Modernizr.sessionstorage) {
        data = sessionStorage["" + type + "_" + key];
        if (data) {
          data = JSON.parse(data);
        }
        return data;
      }
    };

    return ViewModel;

  })();

}).call(this);

//# sourceMappingURL=script.js.map
