** Aditional information **

If you want to customize a multi-select you only have to add an optional class like this (for example):

// This is a multi-select
if ($('select[multiple="multiple"]').length > 0){
  customCombo($('select[multiple="multiple"]'),'multi-select');
}
