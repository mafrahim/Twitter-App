
function configureAPI() {
  renderAPIConfigurationDialog();
}

function renderAPIConfigurationDialog() {
// modified from Twitter Approval Manager 
// http://code.google.com/googleapps/appsscript/articles/twitter_tutorial.html
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var app = UiApp.createApplication().setTitle(
      "Twitter API Authentication Configuration").setHeight(400).setWidth(520);
  app.setStyleAttribute("padding", "10px");
  var dialogPanel = app.createFlowPanel().setWidth("500px");
  var label1 = app.createLabel("1. On the First Run, Copy and Paste the following codes into the the text boxes below and Press Save Configuration.").setStyleAttribute("paddingBottom", "5px");
  var label4 = app.createLabel("Twitter OAuth Consumer Key: deleted").setStyleAttributes({"textIndent": "15px","paddingBottom": "10px","fontWeight": "bold"});
  var label6 = app.createLabel("Twitter OAuth Consumer Secret: deleted").setStyleAttributes({"textIndent": "15px","paddingBottom": "10px","fontWeight": "bold"});
  var label7 = app.createLabel("2. Next run the Authenticate Twitter").setStyleAttribute("paddingBottom", "10px");
  dialogPanel.add(label1);
  dialogPanel.add(label4);
  dialogPanel.add(label6);
  dialogPanel.add(label7);

  var consumerKeyLabel = app.createLabel(
      "Twitter OAuth Consumer Key:");
  var consumerKey = app.createTextBox();
  consumerKey.setName("consumerKey");
  consumerKey.setWidth("90%");
  consumerKey.setText(getConsumerKey());
  var consumerSecretLabel = app.createLabel(
      "Twitter OAuth Consumer Secret:");
  var consumerSecret = app.createTextBox();
  consumerSecret.setName("consumerSecret");
  consumerSecret.setWidth("90%");
  consumerSecret.setText(getConsumerSecret());
  
  var saveHandler = app.createServerClickHandler("saveConfiguration");
  var saveButton = app.createButton("Save Configuration", saveHandler);
  
  var listPanel = app.createGrid(2, 2);
  listPanel.setStyleAttribute("margin-top", "10px")
  listPanel.setWidth("100%");

  listPanel.setWidget(0, 0, consumerKeyLabel);
  listPanel.setWidget(0, 1, consumerKey);
  listPanel.setWidget(1, 0, consumerSecretLabel);
  listPanel.setWidget(1, 1, consumerSecret);


  // Ensure that all form fields get sent along to the handler
  saveHandler.addCallbackElement(listPanel);
  
  dialogPanel.add(listPanel);
  dialogPanel.add(saveButton);
  app.add(dialogPanel);
  doc.show(app);
}
// Given a JavaScript 2d Array, this function returns the transposed table.
// Arguments:
//   - data: JavaScript 2d Array
// Returns a JavaScript 2d Array
// Example: arrayTranspose([[1,2,3],[4,5,6]]) returns [[1,4],[2,5],[3,6]].
function arrayTranspose(data) {
  if (data.length == 0 || data[0].length == 0) {
    return null;
  }

  var ret = [];
  for (var i = 0; i < data[0].length; ++i) {
    ret.push([]);
  }

  for (var i = 0; i < data.length; ++i) {
    for (var j = 0; j < data[i].length; ++j) {
      ret[j][i] = data[i][j];
    }
  }

  return ret;
}

// getColumnsData iterates column by column in the input range and returns an array of objects.
// Each object contains all the data for a given column, indexed by its normalized row name.
// [Modified by mhawksey]
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//       This argument is optional and it defaults to all the cells except those in the first column
//       or all the cells below rowHeadersIndex (if defined).
//   - columnHeadersIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range; 
// Returns an Array of objects.
function getColumnsData(sheet, range, columnHeadersIndex) {
  var headersIndex = columnHeadersIndex || range ? range.getRowIndex() - 1 : 1;
  var dataRange = range || 
    sheet.getRange(1, headersIndex + 1, sheet.getMaxRows(), sheet.getMaxColumns()- headersIndex);
  var numRows = dataRange.getLastRow() - dataRange.getRow() + 1;
  var headersRange = sheet.getRange(dataRange.getRow(),headersIndex,numRows,1);
  var headers = arrayTranspose(headersRange.getValues())[0];
  return getObjects(arrayTranspose(dataRange.getValues()), headers);
}

// setRowsData fills in one row of data per object defined in the objects Array.
// For every Column, it checks if data objects define a value for it.
// Arguments:
//   - sheet: the Sheet Object where the data will be written
//   - objects: an Array of Objects, each of which contains data for a row
//   - optHeadersRange: a Range of cells where the column headers are defined. This
//     defaults to the entire first row in sheet.
//   - optFirstDataRowIndex: index of the first row where data should be written. This
//     defaults to the row immediately below the headers.
function setRowsData(sheet, objects, optHeadersRange, optFirstDataRowIndex) {
  var headersRange = optHeadersRange || sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  var firstDataRowIndex = optFirstDataRowIndex || headersRange.getRowIndex() + 1;
  var headers = normalizeHeaders(headersRange.getValues()[0]);

  var data = [];
  for (var i = 0; i < objects.length; ++i) {
    var values = []
    for (j = 0; j < headers.length; ++j) {
      var header = headers[j];
      values.push(header.length > 0 && objects[i][header] ? objects[i][header] : "");
    }
    data.push(values);
  }

  var destinationRange = sheet.getRange(firstDataRowIndex, headersRange.getColumnIndex(), 
                                        objects.length, headers.length);
  destinationRange.setValues(data);
}
// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//       This argument is optional and it defaults to all the cells except those in the first row
//       or all the cells below columnHeadersRowIndex (if defined).
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range; 
// Returns an Array of objects.
function getRowsData(sheet, range, columnHeadersRowIndex) {
  var headersIndex = columnHeadersRowIndex || range ? range.getRowIndex() - 1 : 1;
  var dataRange = range || 
    sheet.getRange(headersIndex + 1, 1, sheet.getMaxRows() - headersIndex, sheet.getMaxColumns());
  var numColumns = dataRange.getEndColumn() - dataRange.getColumn() + 1;
  var headersRange = sheet.getRange(headersIndex, dataRange.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(dataRange.getValues(), normalizeHeaders(headers));
}

// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}

// Returns an Array of normalized Strings. 
// Empty Strings are returned for all Strings that could not be successfully normalized.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    keys.push(normalizeHeader(headers[i]));
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    //if (!isAlnum(letter)) { // I removed this because result identifiers have '_' in name
    //  continue;
    //}
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char1) {
  return char1 >= 'A' && char1 <= 'Z' ||
    char1 >= 'a' && char1 <= 'z' ||
    isDigit(char1);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char1) {
  return char1 >= '0' && char1 <= '9';
}



 
/**
 * @fileoverview Google Apps Script demo application to illustrate usage of:
 *     MailApp
 *     OAuthConfig
 *     ScriptProperties
 *     Twitter Integration
 *     UiApp
 *     UrlFetchApp
 *     
 * @author vicfryzel@google.com (Vic Fryzel)
 */

/**
 * Key of ScriptProperty for Twitter consumer key.
 * @type {String}
 * @const
 */
var CONSUMER_KEY_PROPERTY_NAME = "twitterConsumerKey";

/**
 * Key of ScriptProperty for Twitter consumer secret.
 * @type {String}
 * @const
 */
var CONSUMER_SECRET_PROPERTY_NAME = "twitterConsumerSecret";

/**
 * Key of ScriptProperty for tweets and all approvers.
 * @type {String}
 * @const
 */
var TWEETS_APPROVERS_PROPERTY_NAME = "twitterTweetsWithApprovers";

/**
 * @param String Approver email address required to give approval
 *               prior to a tweet going live.  Comma-delimited.
 */
function setApprovers(approvers) {
  ScriptProperties.setProperty(APPROVERS_PROPERTY_NAME, approvers);
}

/**
 * @return String OAuth consumer key to use when tweeting.
 */
function getConsumerKey() {
  var key = ScriptProperties.getProperty(CONSUMER_KEY_PROPERTY_NAME);
  if (key == null) {
    key = "";
  }
  return key;
}

/**
 * @param String OAuth consumer key to use when tweeting.
 */
function setConsumerKey(key) {
  ScriptProperties.setProperty(CONSUMER_KEY_PROPERTY_NAME, key.trim());
}

/**
 * @return String OAuth consumer secret to use when tweeting.
 */
function getConsumerSecret() {
  var secret = ScriptProperties.getProperty(CONSUMER_SECRET_PROPERTY_NAME);
  if (secret == null) {
    secret = "";
  }
  return secret;
}

/**
 * @param String OAuth consumer secret to use when tweeting.
 */
function setConsumerSecret(secret) {
  ScriptProperties.setProperty(CONSUMER_SECRET_PROPERTY_NAME, secret.trim());
}

function getIsOAuthed(){
  var oAuth = ScriptProperties.getProperty("authenticated");
  if (oAuth == null) {
    oAuth = "";
  }
  return oAuth;
}


/**
 * @return bool True if all of the configuration properties are set,
 *              false if otherwise.
 */
function isConfigured() {
  return getConsumerKey() != "" && getConsumerSecret() != "" && getIsOAuthed() != "";
}


/** Retrieve config params from the UI and store them. */
function saveConfiguration(e) {
  setConsumerKey(e.parameter.consumerKey);
  setConsumerSecret(e.parameter.consumerSecret);
  var app = UiApp.getActiveApplication();
  //authenticateTwitter();
  app.close();
  return app;
}

 
/**
 * Authorize against Twitter.  This method must be run prior to 
 * clicking any link in a script email.  If you click a link in an
 * email, you will get a message stating:
 * "Authorization is required to perform that action."
 */
function authorize() {
  ScriptProperties.setProperty("authenticated", true);
  var responseData = tw_request("statuses/mentions.json");
}
