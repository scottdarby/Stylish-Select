Additional information
=============

If you want to customize a multi-select you only have to add an optional class like this (for example):

// This is a multi-select
command(
if ($('select[multiple="multiple"]').length > 0){
  customCombo($('select[multiple="multiple"]'),'multi-select');
})


** It's prepared to be showed inside hidden elements (perfect for filter elements) **
This is a jquery bug. It's impossible to set height and width if it's inside a hidden element. 

I've changed plugin to allow this.

Any question: [@raulbarrosoleon](http://twitter.com/raulbarrosoleon)
