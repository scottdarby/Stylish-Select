/*
Stylish Select 0.4.1 - $ plugin to replace a select drop down box with a stylable unordered list
http://github.com/sko77sun/Stylish-Select

Requires: jQuery 1.3 or newer

Contributions from Justin Beasley: http://www.harvest.org/ & Anatoly Ressin: http://www.artazor.lv/

Dual licensed under the MIT and GPL licenses.

*/
(function($){
	//add class to html tag
	$('html').addClass('stylish-select');

	//create cross-browser indexOf
	Array.prototype.indexOf = function (obj, start) {
		for (var i = (start || 0); i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
	}

	//utility methods
	$.fn.extend({
		getSetSSValue: function(value){
			if (value){
				//set value and trigger change event
				$(this).val(value).change();
				return this;
			} else {
				return $(this).find(':selected').val();
			}
		},
		//added by Justin Beasley
		resetSS: function(){
			var oldOpts = $(this).data('ssOpts');
			$this = $(this);
			$this.next().remove();
			//unbind all events and redraw
			$this.unbind('.sSelect').sSelect(oldOpts);
		}
	});

	$.fn.sSelect = function(options) {

		return this.each(function(){

		var defaults = {
			defaultText: 'Please select',
			animationSpeed: 0, //set speed of dropdown
			ddMaxHeight: '', //set css max-height value of dropdown
			containerClass: '' //additional classes for container div
		};

		//initial variables
		var opts = $.extend(defaults, options),
		$input = $(this),
		$containerDivText = $('<div class="selectedTxt"></div>'),
		$containerDiv = $('<div class="newListSelected ' + opts.containerClass + '"></div>'),
		$newUl = $('<ul class="newList" style="visibility:hidden;"></ul>'),
		itemIndex = -1,
		currentIndex = -1,
		keys = [],
		prevKey = false,
		prevented = false,
		$newLi;

		//added by Justin Beasley
		$(this).data('ssOpts',options);

		//build new list
		$containerDiv.insertAfter($input);
		$containerDiv.attr("tabindex", $input.attr("tabindex") || "0");
		$containerDivText.prependTo($containerDiv);
		$newUl.appendTo($containerDiv);
		$input.hide();

		//added by Justin Beasley (used for lists initialized while hidden)
		$containerDivText.data('ssReRender',!$containerDivText.is(':visible'));

            //test for optgroup
            if ($input.children('optgroup').length == 0){
                $input.children().each(function(i){
                    var option = $(this).html();
                    var key = $(this).val();

                    //add first letter of each word to array
                    keys.push(option.charAt(0).toLowerCase());
                    if ($(this).attr('selected') == true){
                        opts.defaultText = option;
                        currentIndex = i;
                    }
                    $newUl.append($('<li><a href="JavaScript:void(0);">'+option+'</a></li>').data('key', key));

                });
                //cache list items object
                $newLi = $newUl.children().children();

            } else { //optgroup
                $input.children('optgroup').each(function(){

                    var optionTitle = $(this).attr('label'),
                    $optGroup = $('<li class="newListOptionTitle">'+optionTitle+'</li>');

                    $optGroup.appendTo($newUl);

                    var $optGroupList = $('<ul></ul>');

                    $optGroupList.appendTo($optGroup);

                    $(this).children().each(function(){
                        ++itemIndex;
                        var option = $(this).html();
                        var key = $(this).val();
                        //add first letter of each word to array
                        keys.push(option.charAt(0).toLowerCase());
                        if ($(this).attr('selected') == true){
                            opts.defaultText = option;
                            currentIndex = itemIndex;
                        }
                        $optGroupList.append($('<li><a href="JavaScript:void(0);">'+option+'</a></li>').data('key',key));
                    })
                });
                //cache list items object
                $newLi = $newUl.find('ul li a');
            }

            //get heights of new elements for use later
            var newUlHeight = $newUl.height(),
            containerHeight = $containerDiv.height(),
            newLiLength = $newLi.length;

            //check if a value is selected
            if (currentIndex != -1){
                navigateList(currentIndex, true);
            } else {
                //set placeholder text
                $containerDivText.text(opts.defaultText);
            }

            //decide if to place the new list above or below the drop-down
            function newUlPos(){
                var containerPosY = $containerDiv.offset().top,
                docHeight = jQuery(window).height(),
                scrollTop = jQuery(window).scrollTop();

                //if height of list is greater then max height, set list height to max height value
                if (newUlHeight > parseInt(opts.ddMaxHeight)) {
                    newUlHeight = parseInt(opts.ddMaxHeight);
                }

                containerPosY = containerPosY-scrollTop;
                if (containerPosY+newUlHeight >= docHeight){
                    $newUl.css({
                        top: '-'+newUlHeight+'px',
                        height: newUlHeight
                    });
                    $input.onTop = true;
                } else {
                    $newUl.css({
                        top: containerHeight+'px',
                        height: newUlHeight
                    });
                    $input.onTop = false;
                }
            }

            //run function on page load
            newUlPos();

            //run function on browser window resize
			$(window).bind('resize.sSelect scroll.sSelect', newUlPos);

            //positioning
            function positionFix(){
                $containerDiv.css('position','relative');
            }

            function positionHideFix(){
                $containerDiv.css('position','static');
            }

            $containerDivText.bind('click.sSelect',function(event){
                event.stopPropagation();

				//added by Justin Beasley
				if($(this).data('ssReRender')) {
					newUlHeight = $newUl.height('').height();
					containerHeight = $containerDiv.height();
					$(this).data('ssReRender',false);
					newUlPos();
				}

                //hide all menus apart from this one
				$('.newList').not($(this).next()).hide()
                    .parent()
                        .css('position', 'static')
                        .removeClass('newListSelFocus');

                //show/hide this menu
                $newUl.toggle();
                positionFix();
                //scroll list to selected item
                $newLi.eq(currentIndex).focus();

            });

            $newLi.bind('click.sSelect',function(e){
                var $clickedLi = $(e.target);

                //update counter
                currentIndex = $newLi.index($clickedLi);

                //remove all hilites, then add hilite to selected item
                prevented = true;
                navigateList(currentIndex);
                $newUl.hide();
                $containerDiv.css('position','static');//ie

            });

            $newLi.bind('mouseenter.sSelect',
				function(e) {
					var $hoveredLi = $(e.target);
					$hoveredLi.addClass('newListHover');
				}
			).bind('mouseleave.sSelect',
				function(e) {
					var $hoveredLi = $(e.target);
					$hoveredLi.removeClass('newListHover');
				}
			);

            function navigateList(currentIndex, init){
                $newLi.removeClass('hiLite')
                .eq(currentIndex)
                .addClass('hiLite');

                if ($newUl.is(':visible')){
                    $newLi.eq(currentIndex).focus();
                }

                var text = $newLi.eq(currentIndex).html();
                var val = $newLi.eq(currentIndex).parent().data('key');

                //page load
                if (init == true){
                    $input.val(val);
                    $containerDivText.text(text);
                    return false;
                }

		try {
		    $input.val(val)
		} catch(ex) {
		    // handle ie6 exception
		    $input[0].selectedIndex = currentIndex;
		}

                $input.change();
                $containerDivText.text(text);
            }

            $input.bind('change.sSelect',function(event){
                $targetInput = $(event.target);
                //stop change function from firing
                if (prevented == true){
                    prevented = false;
                    return false;
                }
                $currentOpt = $targetInput.find(':selected');

                //currentIndex = $targetInput.find('option').index($currentOpt);
                currentIndex = $targetInput.find('option').index($currentOpt);

                navigateList(currentIndex, true);
			});

            //handle up and down keys
            function keyPress(element) {
                //when keys are pressed
                $(element).unbind('keydown.sSelect').bind('keydown.sSelect',function(e){
                    var keycode = e.which;

                    //prevent change function from firing
                    prevented = true;

                    switch(keycode) {
                        case 40: //down
                        case 39: //right
                            incrementList();
                            return false;
                            break;
                        case 38: //up
                        case 37: //left
                            decrementList();
                            return false;
                            break;
                        case 33: //page up
                        case 36: //home
                            gotoFirst();
                            return false;
                            break;
                        case 34: //page down
                        case 35: //end
                            gotoLast();
                            return false;
                            break;
                        case 13:
                        case 27:
                            $newUl.hide();
                            positionHideFix();
                            return false;
                            break;
                    }

                    //check for keyboard shortcuts
                    keyPressed = String.fromCharCode(keycode).toLowerCase();

                    var currentKeyIndex = keys.indexOf(keyPressed);

                    if (typeof currentKeyIndex != 'undefined') { //if key code found in array
                        ++currentIndex;
                        currentIndex = keys.indexOf(keyPressed, currentIndex); //search array from current index
                        if (currentIndex == -1 || currentIndex == null || prevKey != keyPressed) currentIndex = keys.indexOf(keyPressed); //if no entry was found or new key pressed search from start of array


                        navigateList(currentIndex);
                        //store last key pressed
                        prevKey = keyPressed;
                        return false;
                    }
                });
            }

            function incrementList(){
                if (currentIndex < (newLiLength-1)) {
                    ++currentIndex;
                    navigateList(currentIndex);
                }
            }

            function decrementList(){
                if (currentIndex > 0) {
                    --currentIndex;
                    navigateList(currentIndex);
                }
            }

            function gotoFirst(){
                currentIndex = 0;
                navigateList(currentIndex);
            }

            function gotoLast(){
                currentIndex = newLiLength-1;
                navigateList(currentIndex);
            }

            $containerDiv.bind('click.sSelect',function(e){
                e.stopPropagation();
                keyPress(this);
            });

            $containerDiv.bind('focus.sSelect',function(){
                $(this).addClass('newListSelFocus');
                keyPress(this);
            });

            $containerDiv.bind('blur.sSelect',function(){
                $(this).removeClass('newListSelFocus');
            });

            //hide list on blur
            $(document).bind('click.sSelect',function(){
                $containerDiv.removeClass('newListSelFocus');
                $newUl.hide();
                positionHideFix();
            });

            //add classes on hover
            $containerDivText.bind('mouseenter.sSelect',
				function(e) {
					var $hoveredTxt = $(e.target);
					$hoveredTxt.parent().addClass('newListSelHover');
				}
			).bind('mouseleave.sSelect',
				function(e) {
					var $hoveredTxt = $(e.target);
					$hoveredTxt.parent().removeClass('newListSelHover');
				}
            );

            //reset left property and hide
            $newUl.css({
                left: '0',
                display: 'none',
                visibility: 'visible'
            });

        });

    };

})(jQuery);
