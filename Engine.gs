
var MINSIZE = 1; //minimum node size on autofill
var MAXSIZE = 10; //maximum node size on autofill
var CLIENT_NAME_CELL = "B1";
var SEARCH_TERM_CELL = "B2";
var SEARCH_PERIOD_CELL = "B6";
var FOLLOWER_COUNT_CELL = 0;
var NUMBEROFTWEETS = "B4";
var RETWEETS_CELL = "B5";
var ANYTERM_CELL = "B8";
var EXACT_CELL = "B7";
var NONE_CELL = "B9";
var LAT_CELL = "B10";
var LONG_CELL = "B11";
var RAD_CELL = "B12";
var LANG_CELL = "B13";
var MIN_CELL = "B14";
var Share_CELL = "B15";
var TRANS_CELL = "B16";

function authenticateGoogleAnalytics(){
  ScriptProperties.setProperty('haveGAoAuth',true);
  authorizeGA();
}

function onOpen() {  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [];
  // When the user clicks on "addMenuExample" then "Menu Entry 1", the function function1 is executed.
  menuEntries.push({name: "1. Google Authentication", functionName: "testCollection"});
  menuEntries.push({name: "2. Twitter Settings", functionName: "configureAPI"});
  menuEntries.push({name: "3. Twitter Authentication [Tools--> Script Editor --> Run]", functionName: "null"});
  menuEntries.push(null); // line separator
  menuEntries.push({name: "Run Now", functionName: "collectTweets"});
  menuEntries.push({name: "Test Rate", functionName: "testRate"});
  menuEntries.push(null); // line separator
  menuEntries.push({name: getTriggerStatus(), functionName: "toggleTrigger"});
  menuEntries.push({name: getTriggerStatus2(), functionName: "toggleTrigger2"});
  menuEntries.push({name: "Delete duplicates", functionName: "deleteDuplicates"});

  ss.addMenu("Twitter", menuEntries);
 
}

function collectTweets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sumSheet = ss.getSheetByName("Settings");
  var SEARCH_TERM = sumSheet.getRange(SEARCH_TERM_CELL).getValue();
  var ANYTERM = sumSheet.getRange(ANYTERM_CELL).getValue();
  var EXACTTERM = sumSheet.getRange(EXACT_CELL).getValue();
  var NONETERM = sumSheet.getRange(NONE_CELL).getValue();
  var LATTERM = sumSheet.getRange(LAT_CELL).getValue();
  var LONGTERM = sumSheet.getRange(LONG_CELL).getValue();
  var RAD = sumSheet.getRange(RAD_CELL).getValue();
  var LANGTERM = sumSheet.getRange(LANG_CELL).getValue();
  
  var RETWEETS = sumSheet.getRange(RETWEETS_CELL).getValue();
  var SEARCH_DURATION1 = sumSheet.getRange(SEARCH_PERIOD_CELL).getValue();
  
  
  
   var FANYTERM = ANYTERM.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
    if ($1) {
        return $1.replace(/\s/g, '%20OR%20');
    } else {
        return $2; 
    } 
});
  var FEXACTTERM = '"' + EXACTTERM + '"';
  var FNONETERM = NONETERM.replace(/ /g, '%20-');
  var GEOSTRING = LATTERM + "," + LONGTERM + "," + RAD + "km" ;
   SEARCH_TERM = SEARCH_TERM + '%20' + FANYTERM + '%20' + FEXACTTERM + '%20-' + FNONETERM ;

  if (RETWEETS == "No") {
     SEARCH_TERM = SEARCH_TERM + ' -include:retweets' ; //make a new sheet name based on todays date
    }
  
  var lang; 
  if (LANGTERM ==="English") { lang = "en"}
  else if (LANGTERM ==="Arabic") { lang = "ar"}
  else if (LANGTERM ==="Spanish") { lang = "es"}
  else if (LANGTERM ==="Persian") { lang = "fa"}
  else if (LANGTERM ==="Hebrew") { lang = "iw"}
  else if (LANGTERM ==="Turkish") { lang = "tr"};

  
   if (SEARCH_DURATION1 === "All" ){
    var sheetName = "All";
  } else if (SEARCH_DURATION1 === "Today" ){
    sheetName = "Archive";
  } 
   
  else {
    //var sheetName = Utilities.formatDate(new Date(), "GMT", "dd-MMM-yy hh:mm"); //make a new sheet name based on todays date
    
      var period = parseInt(SEARCH_DURATION1.replace(/\D/g,""));
      var until=new Date();
      until.setDate(until.getDate()-period);
    until = Utilities.formatDate(until, "GMT", "dd-MMM-yyyy");
      var sheetName = until;
  }
  
  // if sheetname doesn't exisit make it
  if (!ss.getSheetByName(sheetName)){
    var temp = ss.getSheetByName("TMP");
    //temp.hideSheet();
    var sheet = ss.insertSheet(sheetName, {template:temp});
    
  } else {
    var sheet = ss.getSheetByName(sheetName);
  }
  var sinceid = false;
  var id_strs = sheet.getRange(2, 1, 1501).getValues();
  for (r in id_strs){
    if (id_strs[r][0] != ""){
      sinceid = id_strs[r][0];
      break;
    }
  }
  //if no since id grab search results
  var geo = 0;
  if (LATTERM !="" && LONGTERM !="" && lang !=""){
    geo = 1;
  } else if (LATTERM !="" && LONGTERM !="" && lang ==="" ){
   geo =2 
  } else if (LATTERM ==="" && LONGTERM ==="" && lang !="" ){
   geo =3 
  }
  
  
   if (geo===0)
 { 
    if (sinceid ){
    var data = getTweets(SEARCH_TERM, {"sinceid": sinceid}); // get results from twitter sinceid
  } else {
    var data = getTweets(SEARCH_TERM); // get results from twitter
    
  }
 }
  
  if (geo===1){
  if (sinceid){
    var data = getTweets(SEARCH_TERM, {"sinceid": sinceid, "geocode": GEOSTRING, "lang": lang}); // get results from twitter sinceid
  } else {
    var data = getTweets(SEARCH_TERM, {"geocode": GEOSTRING, "lang": lang}); // get results from twitter
  }
 } 
  
  if (geo===2){
  if (sinceid){
    var data = getTweets(SEARCH_TERM, {"sinceid": sinceid, "geocode": GEOSTRING}); // get results from twitter sinceid
  } else {
    var data = getTweets(SEARCH_TERM, {"geocode": GEOSTRING}); // get results from twitter
  }
 } 
  
 if (geo===3){
  if (sinceid){
    var data = getTweets(SEARCH_TERM, {"sinceid": sinceid, "lang": lang}); // get results from twitter sinceid
  } else {
    var data = getTweets(SEARCH_TERM, {"lang": lang}); // get results from twitter
  }
 }
  
  
 if (geo===0)
 { 
    if (sinceid ){
    var data = getTweets(SEARCH_TERM, {"sinceid": sinceid}); // get results from twitter sinceid
  } else {
    var data = getTweets(SEARCH_TERM); // get results from twitter
    
  }
 }
  
  // if some data insert rows
  if (data.length>0){
    sheet.insertRowsAfter(1, data.length);
    setRowsData(sheet, data);
  }

  
  var temp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TMP");
    temp.hideSheet();
}



function getTweets(searchTerm, optAdvParams) {
  
  var advParams = optAdvParams || {}; 
  var data = [];
  var idx = 0;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sumSheet = ss.getSheetByName("Settings");
  var MIN_FOLLOWER_COUNT = FOLLOWER_COUNT_CELL;
  var trans = sumSheet.getRange(TRANS_CELL).getValue();
  var ANYTERMS = sumSheet.getRange(ANYTERM_CELL).getValue();
  var stringArray = ANYTERMS.split(' ');
  



  Logger.log(ANYTERMS);
  if (!isConfigured()){
    Browser.msgBox("Twitter API Configuration Required");
    return;
  }
  try {
    var max_id = "";
    var max_id_url = "";
    var page = 1;
    var done = false;
    
    var params = {};
    //defaults
    params.q = searchTerm;
    params.count = advParams.count || 100;
    params.result_type = advParams.result_type || "recent";
    params.include_entities = advParams.include_entities || 0;
    
    
    
    if (advParams.sinceid != undefined) {
      params.since_id = advParams.sinceid;
    } 
    if (advParams.lang != undefined) {
      params.lang= advParams.lang;
    }
   if (advParams.geocode != undefined) {
     params.geocode= advParams.geocode;
    }

        var SEARCH_DURATION = sumSheet.getRange(SEARCH_PERIOD_CELL).getValue();
    // prepare search term
    
     if (SEARCH_DURATION === "Today"){
      var until=new Date();
      var since = new Date();
      params.since = twDate(since);
      
    }  else if (SEARCH_DURATION === "All"){
      var until=new Date();
      until.setDate(until.getDate()+1);
      var since = new Date(until);
      since.setDate(since.getDate()-7);
      params.since = twDate(since);
      params.until = twDate(until);
    }
    
    if (SEARCH_DURATION != "Today" && SEARCH_DURATION != "All"){
      var period = parseInt(SEARCH_DURATION.replace(/\D/g,""));
      var until=new Date();
      until.setDate(until.getDate()-period+1);
      var since = new Date(until);
      since.setDate(since.getDate()-1);
      params.since = twDate(since);
      params.until = twDate(until);
    }
    
    var numTweets = sumSheet.getRange(NUMBEROFTWEETS).getValue();
    if (numTweets > 18000)  numTweets = 18000;
    var maxPage = Math.ceil(numTweets/100);
    
    var maxid_str = "";
    
    var queryString = buildUrl("", params); // make url
    Logger.log(queryString);
    while(!done){
      var responseData = tw_request("search/tweets.json"+queryString);
      if (responseData){
        var objects = responseData.statuses;
        if (objects.length>0){ // if data returned
          for (i in objects){ // for the data returned we put in montly bins ready for writting/updating files
            if(objects[i].user.followers_count >= MIN_FOLLOWER_COUNT){
              if (objects[i].geo != null){
                objects[i]["geo_coordinates"] = objects[i].geo.coordinates[0]+","+objects[i].geo.coordinates[1];
                objects[i]["location"] = Maps.newGeocoder().reverseGeocode(objects[i]["geo_coordinates"]).results[3].formatted_address
              }
              for (j in objects[i].user){
                objects[i]["user_"+j] = objects[i].user[j];
              }
              objects[i]["from_user"] = objects[i]["user_screen_name"];
              //objects[i]["from_user_id_str"] = objects[i]["user_id_str"]
              
              ///////////////////////////////////////////////////////////////////////////////
               var index = 0;
           while(index <stringArray.length){
   if(aContainsB(objects[i]["text"], stringArray[index])){
         objects[i]["words"] = stringArray[index];
         break;
            }
          index++;
          }

              
              objects[i]["status_url"] = "http://twitter.com/"+objects[i].user_screen_name+"/statuses/"+objects[i].id_str;
              objects[i]["time"] = new Date(objects[i]["created_at"]);
              //objects[i]["entities_str"] = Utilities.jsonStringify(objects[i]["entities"]);
              if (trans==="Yes")
              objects[i]["translation"] = LanguageApp.translate(objects[i]["text"], '', 'en');
              data[idx]=objects[i];
              
              idx ++;
            }
          }
          if(responseData.search_metadata.max_id_str === objects[objects.length-1]["id_str"]){
            done = true;
          }
          if (responseData.search_metadata.next_results != undefined) {
            queryString = responseData.search_metadata.next_results;
            params.max_id = responseData.search_metadata.max_id_str;
          } else {
            params.max_id = objects[objects.length-1]["id_str"];
            queryString = buildUrl("", params); // make url
          }
        } else { // if not data break the loop
          done = true;
        }
        page ++;
        if (page > maxPage) done = true; // if collected 16 pages (the max) break the loop
      }
    } //end of while loop
    return data;
  } catch (e) {
    Browser.msgBox("Line "+e.lineNumber+" "+e.message+e.name);
    //Browser.msgBox("Line "+e.lineNumber+" "+e.message+e.name);
    ScriptProperties.setProperty("errormsg","Line "+e.lineNumber+" "+e.message+e.name);
    return;
  }
} 

/**
 * Build a querystring from a object http://stackoverflow.com/a/5340658/1027723
 * @param {String} base url.
 * @param {Object} objects to add to string.
 * @return {String} url.
 */
function buildUrl(url, parameters){
  var qs = "";
  for(var key in parameters) {
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURL(value) + "&";
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); //chop off last "&"
    url = url + "?" + qs;
  }
  return url;
}

function filterUnique(tweets){
  var output = [];
  var temp = {};
  tweets.reverse();
  for (i in tweets){
    if (tweets[i][2] !="text"){
      if (i>0){
        var tmp = tweets[i][2];
        var urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        tmp = tmp.replace(urlPattern,"")
        tmp = tmp.substring(0,parseInt(tmp.length*0.9));
        var link = "http://twitter.com/"+tweets[i][1]+"/statuses/"+tweets[i][0].trim();
        if (temp[tmp] == undefined){
          temp[tmp] = [tweets[i][2],0,link];
        }
        temp[tmp] = [tweets[i][2],temp[tmp][1]+1,link]; 
        //output.push([tmp]);
      }
    }
  }
  for (i in temp){
    output.push([temp[i][0],temp[i][1],temp[i][2]]);
  }
  output.sort(function(a,b) {
    return  b[1]-a[1];
  });
  return output.slice(0, 12);
}

function returnId(){
  return SpreadsheetApp.getActiveSpreadsheet().getId();
}

function testCollection(){  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sumSheet = ss.getSheetByName("Settings");
  var SEARCH_TERM = sumSheet.getRange(SEARCH_TERM_CELL).getValue();  
  var data = getTweets(SEARCH_TERM, {"count":5}); // get results from twitter
  if (data.length>0){
    Browser.msgBox("Found some tweets. Here's an example one from "+data[0]["from_user"]+" which says: "+data[0]["text"]);
  } else {
    Browser.msgBox("Twitter said: "+ScriptProperties.getProperty("errormsg"));
  }
}

function twDate(aDate){
  var dateString = Utilities.formatDate(aDate, "GMT", "yyyy-MM-dd");
  return dateString;
}

function deleteDuplicates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Archive");
  var dups = {};
  var rows = [];
  var toDelete = [];
  var id_strs = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
  var row = id_strs.length;
  for (r in id_strs){
    var id_str = id_strs[r][0].trim();
    if (dups[id_str] == undefined){
      dups[id_str] = 1;
    } else {
      rows.push(parseInt(r));
    }
    row--;
  }
  // http://stackoverflow.com/a/3844632/1027723
  var count = 0;
  var firstItem = 0; // Irrelevant to start with
  for (x in rows) {
    // First value in the ordered list: start of a sequence
    if (count == 0) {
      firstItem = rows[x];
      count = 1;
    }
    // Skip duplicate values
    else if (rows[x] == firstItem + count - 1) {
      // No need to do anything
    }
    // New value contributes to sequence
    else if (rows[x] == firstItem + count) {
      count++;
    }
    // End of one sequence, start of another
    else {
      if (count >= 3) {
        Logger.log("Found sequence of length "+count+" starting at "+firstItem);
        toDelete.push([firstItem+1,count]);
      }
      count = 1;
      firstItem = rows[x];
    }
  }
  if (count >= 3) {
    Logger.log("Found sequence of length "+count+" starting at "+firstItem);
    toDelete.push([firstItem+1,count]);
  }
  toDelete.reverse();
  for (r in toDelete){
    var resp = Browser.msgBox("Delete duplicate rows "+toDelete[r][0]+" to "+(parseInt(toDelete[r][0])+parseInt(toDelete[r][1])), Browser.Buttons.OK_CANCEL);
    if (resp == "ok") sheet.deleteRows(toDelete[r][0], toDelete[r][1]);
  }
}

function testRate(){
  var api_request = "application/rate_limit_status.json?resources=users,search,statuses";
  var data = tw_request(api_request);
  var output = {};
  output.search = data.resources.search["/search/tweets"];
  output.user_id = data.resources.users["/users/show/:id"];
  output.user_lookup = data.resources.users["/users/lookup"];
  output.statuses_embeds = data.resources.statuses["/statuses/oembed"];
  
  Browser.msgBox(JSON.stringify(output,"","\t"));
  Logger.log(data.toString());
  return data;
}

/**
 * Toggles the script trigger to refresh archive 
 */
function toggleTrigger(){
var time = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange(MIN_CELL).getValue();
  
var test = getTriggerID();
  if (getTriggerID() == "none"  || getTriggerID() == null){ // add trigger
    var dailyTrigger = ScriptApp.newTrigger("collectTweets")
        .timeBased().everyMinutes(time).create();
    setTriggerID(dailyTrigger.getUniqueId());
    onOpen();
  } else {
    var triggers = ScriptApp.getScriptTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getUniqueId() == getTriggerID()){
        ScriptApp.deleteTrigger(triggers[i]);
        setTriggerID("none");
        onOpen();
        break;
      }
    }
  }
  
}

/**
 * Gets trigger menu option text
 * @return {String} Stats text for menu.
 */
function getTriggerStatus(){
  if (getTriggerID() == "none" || getTriggerID() == null) return "Auto Update Archive";
  return "Stop Updating Archive"
}

/**
 * @param {String} set a trigger id.
 */
function setTriggerID(id){
  ScriptProperties.setProperty("triggerID", id);
}

/**
 * @return {String} get a trigger id.
 */
function getTriggerID(){
  return ScriptProperties.getProperty("triggerID");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

function toggleTrigger2(){
var test2 = getTriggerID2();
  if (getTriggerID2() == "none"  || getTriggerID2() == null){ // add trigger
    var dailyTrigger2 = ScriptApp.newTrigger("exporter")
    .timeBased().atHour(2).everyDays(1).create();
   
        
    setTriggerID2(dailyTrigger2.getUniqueId());
    onOpen();
  } else {
    var triggers2 = ScriptApp.getScriptTriggers();
    for (var i = 0; i < triggers2.length; i++) {
      if (triggers2[i].getUniqueId() == getTriggerID2()){
        ScriptApp.deleteTrigger(triggers2[i]);
        setTriggerID2("none");
        onOpen();
        break;
      }
    }
  }
  
}

/**
 * Gets trigger menu option text
 * @return {String} Stats text for menu.
 */
function getTriggerStatus2(){
  if (getTriggerID2() == "none" || getTriggerID2() == null) return "Export Daily";
  return "Stop Exporting Daily"
}

/**
 * @param {String} set a trigger id.
 */
function setTriggerID2(id2){
  ScriptProperties.setProperty("triggerID2", id2);
}

/**
 * @return {String} get a trigger id.
 */
function getTriggerID2(){
  return ScriptProperties.getProperty("triggerID2");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

function tw_request(api_request, optMethod){
  var oauthConfig = UrlFetchApp.addOAuthService("twitter");
  oauthConfig.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
  oauthConfig.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
  oauthConfig.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
  oauthConfig.setConsumerKey(getConsumerKey());
  oauthConfig.setConsumerSecret(getConsumerSecret());
  var requestData = {
        "method": optMethod || "GET",
        "oAuthServiceName": "twitter",
        "oAuthUseToken": "always"
      };
   try {
      var result = UrlFetchApp.fetch("https://api.twitter.com/1.1/"+api_request, requestData);
      if (result.getResponseCode() === 200){
        return Utilities.jsonParse(result.getContentText());
      } else {
        return false;
      }
    } catch (e) {
      Logger.log(e);
    }
}

// suggested by Sergii Kauk https://plus.google.com/u/0/+AmitAgarwal/posts/FSuCNdh7jJ1
function encodeURL(string){
  return encodeURIComponent(string).replace(/!|\*|\(|\)|'/g, function(m){return "%"+m.charCodeAt(0).toString(16)});
}

function alltrim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

function replicate (n, x) {
  var xs = [];
  for (var i = 0; i < n; ++i) {
    xs.push(x);
  }
  return xs;
}

// http://jsfromhell.com/array/chunk
function chunk(a, s){
    for(var x, i = 0, c = -1, l = a.length, n = []; i < l; i++)
        (x = i % s) ? n[c][x] = a[i] : n[++c] = [a[i]];
    return n;
}
// http://snook.ca/archives/javascript/testing_for_a_v
function oc(a)
{
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
}
function exporter() {
  var sumSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  var Client_Name = sumSheet.getRange(CLIENT_NAME_CELL).getValue(); 
  var tonight=new Date();
  tonight.setDate(tonight.getDate()-1);
  var newSpreadsheet = SpreadsheetApp.create( Client_Name + Utilities.formatDate(tonight, "GMT", " dd-MM-yyyy hh:mm"));
  var originalSpreadsheet = SpreadsheetApp.getActive();
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet(sheet.getSheetByName('Archive'));
  sheet = originalSpreadsheet.getActiveSheet();
  removeDuplicates();
  
  sheet.copyTo(newSpreadsheet);
  newSpreadsheet.deleteActiveSheet();
  //newSpreadsheet.renameActiveSheet("Archive");

  var ssID = newSpreadsheet.getId();
  var ssID2 = originalSpreadsheet.getId();
  var fileInDrive = DriveApp.getFolderById(ssID2);
  var folderinDrive = fileInDrive.getParents().next().getId();
  DocsList.getFileById(ssID).addToFolder(DocsList.getFolderById(folderinDrive));
  DocsList.getFileById(ssID).removeFromFolder(DocsList.getRootFolder());
  SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
  var temp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TMP");
  SpreadsheetApp.getActiveSpreadsheet().insertSheet("Archive", {template:temp});
  
  
}


function removeDuplicates() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row[2] == newData[j][2]){
  duplicate = true;
}
    }
    if(!duplicate){
      newData.push(row);
    }
  }
  sheet.clearContents();
  sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
}

function aContainsB (a, b) {
    
    return a.toLowerCase().indexOf(b.toLowerCase()) >= 0;
}
