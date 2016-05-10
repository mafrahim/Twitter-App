

function AuthenticateTwitter(){
  ScriptProperties.setProperty('active', SpreadsheetApp.getActiveSpreadsheet().getId());
  authorize();
}