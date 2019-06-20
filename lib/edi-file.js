var _ = require('lodash'),
	moment = require('moment');

var EdiFile = function(registers, options) {
	if(!registers) {
		throw new Error("Missing registers.");
	}

	if(!options) {
		options = {};
	}

	// Set default date format
	if(!options.dateFormat) {
		options.dateFormat = "YYYYMMDD";
	}

	// Sort registers by start position
	registers = _.sortBy(registers, 'start');

	// Validate registers definition
	_.each(registers, function(fields){
		var previousFieldEnd = 0;

		_.each(fields, function(field, i){
			// First field shouldn't be the register ID (which starts at 1).
			if(i == 0 && field.start != 2) {
				throw new Error("First fields doesn't start at position 2.");
			} else if(i != 0 && field.start != previousFieldEnd + 1) {
				throw new Error("Invalid start of field '" + field.name + "'.");
			}

			previousFieldEnd = field.end;
		});
	});

	this.registers = registers;
	this.options = options;
};

EdiFile.prototype.parse = function(fileContent) {
	const lineEnding = ((fileContent)=>{
		var temp = fileContent.indexOf("\n");
		if (fileContent[temp - 1] === "\r") return "\r\n";
		return "\n";
	})(fileContent)
	


	var lines = fileContent.split(lineEnding);

	var registers = {};

	_.each(lines, function(line){
		var registerId = line[0];
		var parsedLine = this.parseLineWithRegister(line, this.registers[line[0]]);

		if(!registers[registerId]){
			registers[registerId] = [];
		}

		registers[registerId].push(parsedLine);
	}.bind(this));

	return registers;
};

EdiFile.prototype.parseLineWithRegister = function(line, fields) {
	var parsedLine = {};

	_.each(fields, function(field){
		var fieldContent = line.substring(field.start - 1, field.end);

		if(field.type == 'number') {
			fieldContent = parseInt(fieldContent);
		} else if(field.type == 'string') {
			fieldContent = ('' + fieldContent).trim();
		} else if(field.type == 'date') {
			fieldContent = moment(fieldContent, this.options.dateFormat).toDate();
		}

		parsedLine[field.name] = fieldContent;
	}.bind(this));

	return parsedLine;
};

module.exports = EdiFile;
