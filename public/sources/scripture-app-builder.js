const fs = require('fs')
const path = require('path');
var libxmljs = require("libxmljs");
var grammar = require('usfm-grammar')

const {
  Project,
  Book,
  Chapter,
  getDirectories,
  findObjectByKey,
  getMatches,
  bibleNames
} = require('./util')

var xmlDoc
var xmlString  //used to hold the xml we are building
const PROJECT_TYPE = 'scriptureAppBuilder'

function getProjectStructure(rootDirectories = []) {
  try {
    return flatten(
      rootDirectories.map(directory => {
        return getDirectories(directory).map(name => makeProject(name, directory));
      })
    )
  } catch(error) {
    console.error(error)
    return [];
  }
}

function makeProject(name, directory) {
  let project = new Project(PROJECT_TYPE);
  project.name = name;

  var fileName = path.join(directory, name, name)
  fileName += '.appDef'

  contents = fs.readFileSync(fileName, 'utf8') 
  
  xmlDoc = libxmljs.parseXml(contents);
  project.books = makeBook(contents);
  
  return project;    
}

function makeBook(fileContents){
	let booksRegex = /book\sid=\"(.*)\">/g; 
	booksArray = getMatches(fileContents, booksRegex, 1);	
	var finalJsonString = '[';

	for (var i = 0; i < booksArray.length; i++) { //loop through all the books
    if(findObjectByKey(bibleNames, 'SAB', booksArray[i])){
        var bookName = findObjectByKey(bibleNames, 'SAB', booksArray[i])['BibleName'];
        jsonString = '{"name":"' +	bookName + '","chapters":[';

        var chapterString = "//book[@id='" + booksArray[i] + "']/audio/@chapter"; //find all chapters with audio
        let chapterRegex = /chapter=\"([\d]*)\"/g;  
        chaptersArray = getMatches(xmlDoc.find(chapterString).toString(), chapterRegex, 1).toString().split(",");

        for (var j = 0; j < chaptersArray.length; j++) { //loop through all the books
          jsonString += '{"name":"' + chaptersArray[j] + '", "audioFiles": ['; 
          var fileString = "//book[@id='" + booksArray[i] + "']/audio[@chapter='" + chaptersArray[j] + "']/filename/text()";
          fileName = xmlDoc.find(fileString).toString();

          if(fileName){
            jsonString += '"' + fileName + '",'
          }
          else{
            jsonString = '';  //no audio chapter, empty out whole string
          }

          if(jsonString != ''){
            jsonString = jsonString.substring(0, jsonString.length - 1); //chop off last comma
            jsonString += ']},'
            //"textXmlFile": "' + booksArray[i] + '-' + chaptersArray[j] + '.xml"},' //will handle xml building on demand
          }
        }

        if(jsonString != ''){ 
          jsonString = jsonString.substring(0, jsonString.length - 1);
          jsonString += ']},';
        }
        finalJsonString += jsonString; 
    }
	}  

  if(finalJsonString == '['){
    finalJsonString = '' //if only opening bracket means string is empty 
  }
	if(finalJsonString != '' ){ 
		finalJsonString = finalJsonString.substring(0, finalJsonString.length - 1);
		finalJsonString += ']';
	}
  if(finalJsonString != ''){
 
  return(JSON.parse(finalJsonString));
  } else {
    return [];
  }
}

function makeTextXMLFile(project, book, chapter, dest, directory){
  var fileName = path.join(directory, project, project)
  fileName += '.appDef'

  var SABBookName = findObjectByKey(bibleNames, 'BibleName', book)['SAB']; //this converts the passed in regular bible book name into SAB abbreviation

  contents = fs.readFileSync(fileName, 'utf8')   
  xmlDoc = libxmljs.parseXml(contents);

	// bookPath = '/Users/ray//AppBuilder/Scripture Apps/App Projects/ShanBiblePublish latest-Chant/ShanBiblePublish latest-Chant_data/books/'
	sfmFileName = path.join(directory, project, project) + '_data/books' + '/' + xmlDoc.get("string(//book[@id='" + SABBookName + "']/filename/text())");
	
	xmlString = '<?xml version=\"1.0\" encoding=\"utf-8\"?\>'
  xmlString += '<ChapterInfo Number="' + chapter + '"><Recordings>'
	
	fs.readFile(sfmFileName, 'utf8', function(err, fileContents) { //TODO prefix sfmFileName with path where SFM is located
	fileContents = fileContents.concat('\\EOF') //end of file does not have chapter tag, add this tag manually so can match in one regex

	let firstLinePattern = /\\id (.*?)\n/gs;
	firstLine = fileContents.match(firstLinePattern);

	let regexpChapter = /\\c ([0-9]+)(.*?)(?=(\\c|\\EOF))/gs; 
	chapterArray = 	fileContents.match(regexpChapter);

	chapterText = firstLine + chapterArray[chapter-1]
	var jsonCleanOutput = new grammar.USFMParser(chapterText, grammar.SCRIPTURE)

	let regexpVerse = /\"verseText\":\"(.*?)\"/gs; 
	verseArray = JSON.stringify(jsonCleanOutput).match(regexpVerse); 

	var i;
	const regReplace = /<|<<|>|>>/gi
	for (i = 0; i < verseArray.length; i++) {
		xmlString += '<ScriptLine><LineNumber>' + (i+1) + '</LineNumber><Text>'
		xmlString += verseArray[i].replace(regReplace, '')
		// console.log(xmlString);
		xmlString += '</Text><RecordingTime>2020-02-27T03:41:28.3487045Z</RecordingTime><Verse>' + (i+1)
		xmlString += '</Verse><Heading>false</Heading></ScriptLine>'
		// console.log('verse ' + i+1 + xmlString);
	}
	xmlString += '  </Recordings><Source /></ChapterInfo>'
	// console.log(xmlString);	
	fs.appendFileSync(dest + '/' + book + '-' + chapter + '.xml', xmlString);

	})
}

// test case 1, jus to output result of the function, need to look out for projects with on audio files, they will be returned but the project.books array will be empty by design
// let myProjects = getProjectStructure();
// console.log(JSON.stringify(myProjects));

// test case 2: make xml file by passing (project, book, chapter, destination)
// makeTextXMLFile('ShanBiblePublish latest-Chant', 'Leviticus', '2', '/Users/ray/Downloads', '');

module.exports = {
  PROJECT_TYPE,
  getProjectStructure,
};
