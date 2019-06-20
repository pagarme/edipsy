var should = require('should'),
	_ = require('lodash'),
	EdiFile = require('../index').EdiFile;

describe("EdiFile", function(){
	describe("when creating without registers", function(){
		var ediFile, exception;

		before(function(done){
			try {
				ediFile = new EdiFile();
			} catch(e) {
				exception = e;
			}

			done();
		});

		it("should throw exception", function(){
			exception.should.be.ok;
		});
	});

	describe("when creating with register with first field not starting at 2", function(){
		var ediFile, exception;

		before(function(done){
			try {
				ediFile = new EdiFile({
					"0": [{
						start: 5,
						end: 7
					}]
				});
			} catch(e) {
				exception = e;
			}

			done();
		});

		it("should throw exception", function(){
			exception.should.be.ok;
		});
	});

	describe("when creating with register with field with invalid start", function(){
		var ediFile, exception;

		before(function(done){
			try {
				ediFile = new EdiFile({
					"0": [{
						start: 2,
						end: 3
					}, {
						start: 5,
						end: 7
					}]
				});
			} catch(e) {
				exception = e;
			}

			done();
		});

		it("should throw exception", function(){
			exception.should.be.ok;
		});
	});

	describe("when creating with valid registers definition ", function(){
		var ediFile, exception;

		before(function(done){
			try {
				ediFile = new EdiFile({
					"0": [{
						name: 'user_name',
						start: 2,
						end: 17,
						type: 'string',
					}, {
						name: 'user_gender',
						start: 18,
						end: 18,
						type: 'string',
					}, {
						name: 'user_ssn',
						start: 19,
						end: 29,
						type: 'number',
					}, {
						name: 'user_born_at',
						start: 30,
						end: 38,
						type: 'date'
					}],
					"1": [{
						name: 'product_amount',
						start: 2,
						end: 7,
						type: 'number',
					}, {
						name: 'product_name',
						start: 8,
						end: 19,
						type: 'string',
					}, {
						name: 'product_bought_at',
						start: 20,
						end: 27,
						type: 'date'
					}],
					"2": [{
						name: 'products_amount',
						start: 2,
						end: 7,
						type: 'number',
					}, {
						name: 'products_count',
						start: 8,
						end: 10,
						type: 'number',
					}]
				}, {
					dateFormat: "DDMMYYYY",
				});
			} catch(e) {
				exception = e;
			}

			done();
		});

		it("should not throw exception", function(){
			(exception == null).should.be.ok;
		});

		describe("when parsing file content", function(){
			var parsedFile;

			var fileContent = '\
0JOHN APPLESEED  M1192171329619071996\n\
1300000MACBOOK AIR 11062015\n\
1150000IPHONE 6S   01082014\n\
2450000002';

			before(function(done){
				parsedFile = ediFile.parse(fileContent)
				done();
			});

			describe("register 0", function(){
				it("should have 1 line", function(){
					parsedFile['0'].should.have.lengthOf(1);
				});

				it("first line should have the correct user_name", function(){
					parsedFile['0'][0].should.have.property('user_name', 'JOHN APPLESEED');
				});

				it("first line should have the correct user_gender", function(){
					parsedFile['0'][0].should.have.property('user_gender', 'M');
				});

				it("first line should have the correct user_ssn", function(){
					parsedFile['0'][0].should.have.property('user_ssn', '11921713296');
				});

				it("first line should have the correct user_born_at", function(){
					parsedFile['0'][0].should.have.property('user_born_at', new Date(1996, 06, 19));
				});
			});

			describe("register 1", function(){
				it("should have 2 lines", function(){
					parsedFile['1'].should.have.lengthOf(2);
				});

				it("first line should have the correct product_name", function(){
					parsedFile['1'][0].should.have.property('product_name', 'MACBOOK AIR');
				});

				it("first line should have the correct product_amount", function(){
					parsedFile['1'][0].should.have.property('product_amount', 300000);
				});

				it("first line should have the correct product_bought_at", function(){
					parsedFile['1'][0].should.have.property('product_bought_at', new Date(2015, 05, 11));
				});

				it("second line should have the correct product_name", function(){
					parsedFile['1'][1].should.have.property('product_name', 'IPHONE 6S');
				});

				it("second line should have the correct product_amount", function(){
					parsedFile['1'][1].should.have.property('product_amount', 150000);
				});

				it("second line should have the correct product_bought_at", function(){
					parsedFile['1'][1].should.have.property('product_bought_at', new Date(2014, 07, 01));
				});
			});

			describe("register 2", function(){
				it("should have 1 line", function(){
					parsedFile['2'].should.have.lengthOf(1);
				});

				it("first line should have the correct products_amount", function(){
					parsedFile['2'][0].should.have.property('products_amount', 450000);
				});

				it("first line should have the correct products_count", function(){
					parsedFile['2'][0].should.have.property('products_count', 2);
				});
			});
		});


		describe("when parsing file content CRLF", function(){
			var parsedFile;

			var fileContent = '\
0JOHN APPLESEED  M1192171329619071996\r\n\
1300000MACBOOK AIR 11062015\r\n\
1150000IPHONE 6S   01082014\r\n\
2450000002';

			before(function(done){
				parsedFile = ediFile.parse(fileContent)
				done();
			});

			describe("register 0", function(){
				it("should have 1 line", function(){
					parsedFile['0'].should.have.lengthOf(1);
				});

				it("first line should have the correct user_name", function(){
					parsedFile['0'][0].should.have.property('user_name', 'JOHN APPLESEED');
				});

				it("first line should have the correct user_gender", function(){
					parsedFile['0'][0].should.have.property('user_gender', 'M');
				});

				it("first line should have the correct user_ssn", function(){
					parsedFile['0'][0].should.have.property('user_ssn', '11921713296');
				});

				it("first line should have the correct user_born_at", function(){
					parsedFile['0'][0].should.have.property('user_born_at', new Date(1996, 06, 19));
				});
			});

			describe("register 1", function(){
				it("should have 2 lines", function(){
					parsedFile['1'].should.have.lengthOf(2);
				});

				it("first line should have the correct product_name", function(){
					parsedFile['1'][0].should.have.property('product_name', 'MACBOOK AIR');
				});

				it("first line should have the correct product_amount", function(){
					parsedFile['1'][0].should.have.property('product_amount', 300000);
				});

				it("first line should have the correct product_bought_at", function(){
					parsedFile['1'][0].should.have.property('product_bought_at', new Date(2015, 05, 11));
				});

				it("second line should have the correct product_name", function(){
					parsedFile['1'][1].should.have.property('product_name', 'IPHONE 6S');
				});

				it("second line should have the correct product_amount", function(){
					parsedFile['1'][1].should.have.property('product_amount', 150000);
				});

				it("second line should have the correct product_bought_at", function(){
					parsedFile['1'][1].should.have.property('product_bought_at', new Date(2014, 07, 01));
				});
			});

			describe("register 2", function(){
				it("should have 1 line", function(){
					parsedFile['2'].should.have.lengthOf(1);
				});

				it("first line should have the correct products_amount", function(){
					parsedFile['2'][0].should.have.property('products_amount', 450000);
				});

				it("first line should have the correct products_count", function(){
					parsedFile['2'][0].should.have.property('products_count', 2);
				});
			});
		});
	});
});
