function playback(){
	var listOfRevisions = [], pageTitle, startRev, endRev, revisionInfo, modifyList;
	var playAnimation = true;
	this.animationSpeed = 500;
	var usingLanguageNamespace = 'en';
	var modifyList =[];
	var revisionListDict = {
		'format': 'json',
		'action': 'query',
		'prop': 'revisions',
		'rvprop': 'ids|user|timestamp|size|flags',
		'rvdir': 'newer',
	};
	
	var compareRevisionDict = {
		'format': 'json',
		'action': 'query',
		'prop': 'revisions',
		'rvprop': 'content',
		'rvexpandtemplates': '',
		'rvparse': '',
	};
	
	var baseUrl = 'https://en.wikipedia.org/w/api.php?callback=?';
	var that = this;
	this.wikiNameSpace = function (language) {
	  usingLanguageNamespace = language;
	  baseUrl = 'https://'+language+'.wikipedia.org/w/api.php?callback=?';
	};
	
	this.getRevisions = function (page,selectedEdits){

			listOfRevisions = selectedEdits;
	        pageTitle = page;
	        startRev = listOfRevisions.shift().revid;
	        revisionInfo = listOfRevisions[0];
	        endRev = revisionInfo.revid;
	        listOfRevisions.shift();
	        that.wikiDiff();
       
	};
	this.wikiDiff = function(){
	    //Creating the info box about the revisions
        var revInfo = {
				'title': pageTitle,
				'revid': revisionInfo.revid,
				'user': revisionInfo.user,
				'timestamp': revisionInfo.timestamp.slice(0,10),
				'anon': revisionInfo.hasOwnProperty('anon')? 'anon' : null,
				'minor': revisionInfo.hasOwnProperty('minor')? 'minor' : null
		};
		that.infoBox(revInfo);
        compareRevisionDict['revids'] = startRev;
        $.getJSON(baseUrl,compareRevisionDict,function(dataFirst){
			var resultKey = Object.keys(dataFirst.query.pages);
			var dataFirstRev = dataFirst.query.pages[resultKey].revisions[0]['*'];
			compareRevisionDict['revids'] = endRev;
			$.getJSON(baseUrl,compareRevisionDict,function(dataSecond){
				var resultKey = Object.keys(dataSecond.query.pages);
				var dataSecondRev = dataSecond.query.pages[resultKey].revisions[0]['*'];
				//html diff
				var modifiedHtml = HtmlDiff.formatTextDiff(dataFirstRev,dataSecondRev);
				$('#wikiBody').html(modifiedHtml);
				modifyList = $.makeArray($('del,ins'));
				that.animateDiff();
			});
		});		
	};
	
	this.infoBox = function (revInfo){
        $('.infoBox').html('');
        for (key in revInfo){                   
            if(key == 'revid'){
                var urlBase = 'https://'+usingLanguageNamespace+'.wikipedia.org/w/index.php?oldid='+revInfo[key];
                var anchor =$('<a>'+revInfo[key]+'</a>').attr({'target':'_blank','href':urlBase});
                 $('.infoBox').append(anchor);
            }
            else{
                $('.infoBox').append('<span>'+revInfo[key]+'</span>');
            }
        }
	};
	
	this.animateDiff = function () {
		if(playAnimation){
            setTimeout(function(){
                if(modifyList.length>0){
                    var element = modifyList[0];
                    element.scrollIntoView(true);
                    //customScrollIntoView('#wikiBody',element);
                   
                    if ($(element).prop('tagName') == 'DEL'){
                        //customScrollIntoView('#wikiBody',element);
                        $(element).fadeOut(that.animationSpeed);
                    }
                    else{
                        $(element).fadeIn(that.animationSpeed);
                         /* Temp fix for scroll into view */
                        element.scrollIntoView(true);
                        //customScrollIntoView('#wikiBody',element);
                    }
                    modifyList.shift();
                    that.animateDiff();
				}
                else{
                    if(listOfRevisions.length>0){
                        startRev = endRev;
                        revisionInfo = listOfRevisions.shift();
                        endRev = revisionInfo.revid;
                        //setTimeout(wiki_diff,200);
                        that.wikiDiff();
                    }
                    else{
						$('#playButton').removeClass().addClass('play');
                    }
				}
			},that.animationSpeed);
		}
	};
	
	this.customScrollIntoView = function(parent,element){
		console.log(' ',element,' ',$(element).offset().top);
		$(parent).animate({scrollTop: $(element).offset().top}, 100);
	};
	
	this.startPlayback = function(button){
		var page = $('#page_name').val();
	    var rev = $('#page_rev').val();
	    //Handling the case where the the player was paused
	    if(listOfRevisions.length > 0){
	        $(button).removeClass('play').addClass('pause');
	        playAnimation = true;
	        that.animateDiff();
	    }
	    else{
	        that.getRevisions(page,rev); 
	    }
	};
	
	this.pausePlayback = function(button){
		$(button).removeClass('pause').addClass('play');
		$('del,ins').finish();
		playAnimation = false;
	};
	//Attaching control for play / pause
	this.playbackControl  = function(){
		$('#playButton').click(function(){
			var button = this;
			if($(button).hasClass('play')){
				that.startPlayback(button);		    
			}
			else{
				that.pausePlayback(button);
			}
		});
	};
};

function addLanguageOptions(languages){
	for(language in languages){
		var option = $('<option>').val(language).html(languages[language]);
		$('select.languageNamespace').append(option);
	}
};

//The fullscreen Api handling
function fullscreenApi(screen){
	var elem = $(screen).get(0);
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} 
	else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} 
	else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	}
};