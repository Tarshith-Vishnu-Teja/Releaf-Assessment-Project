var ejs = require("ejs");
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/Releaf";
var passport = require('passport');
var session = require('client-sessions');
var ObjectId = require('mongodb').ObjectId;

//API to sign up user
exports.signUp = function(req, res){
	var username = req.param('username');
	var password = req.param('password');
	var admin = req.param('admin');
	
	mongo.connect(mongoURL, function(){
		var users = mongo.collection('users');
		users.findOne({username:username}, function(err, user){			//finding if that user already exists or not
			if(err){
				res.send({
		    	  "status_code" : 500
		      });
			}
			else if(!user){																			//if user does not exist, add him to database
				users.insert({
					"username":username,
					"password":password,
					"admin": admin
				})
				res.send({"status_code": 200})
			}
			else{
				res.send({
					"status_code": 403,
					"error_message": "User already exists!"
				})
			}
		});
	});
};

//API to login the user and authenticate him
exports.login = function(req, res, next) {
	passport.authenticate('login', function(err, user, info) {
	    if(err) {
	      return res.send({
	    	  "status_code" : 500
	      });
	    }
	    if(!user) {
	    	return res.send({
	    		"status_code" : 403,
				"error_message": "Username does not exist or Username and password do not match"
	    		});
	    }else{
		    req.logIn(user, {session:false}, function(err) {
	            if(err) {
	            return res.send({
					"status_code": 403,
					"error_message": "Username does not exist or Username and password do not match"
					});
	            }
	            req.session.userDetails = user;
	            console.log("session initilized = " + req.session.userDetails);
	            return res.send({"status_code" : 200});
		    });
	    }
	})(req, res, next);
};

//API to add the company to database by admin
exports.adminAddCompany = function(req, res){
	if(req.session.userDetails.admin){													//checking if user is admin or not
		var name = req.body.name;
		var num_employees = req.body.num_employees;
		var year_founded = req.body.year_founded;
		var contact_name = req.body.contact_name;
		var contact_email = req.body.contact_email;
		var rankings = {
				"financials" : req.body.rankings.financials,
				"team" : req.body.rankings.team,
				"idea" : req.body.rankings.idea
		};
		
		var companyDetails = {
				"name" : name,
				"num_employees" : num_employees,
				"year_founded" : year_founded,
				"contact_name" : contact_name,
				"contact_email" : contact_email,
				"rankings" : rankings
		};
		var company = mongo.collection('companies');
		mongo.connect(mongoURL,function(){
			company.findOne({"name":name}, function(err, user){
				if(err){
					res.send({"status_code" : 500});
				}
				else if(!user){
					company.insert(companyDetails);
					res.send({"status_code":200});
				}
				else
					res.send({
						"status_code":403,
						"error_message" : "company already exists!"
					});
			});
		});
	}
	else{
		res.send({
			"status_code" : 401,
			"error_message": "Unauthorized"
		})
	}
};

//API to remove the company from database by admin
exports.adminRemoveCompany = function(req, res){
	if(req.session.userDetails.admin){
		var name = req.body.name;
		
		var company = mongo.collection('companies');
		mongo.connect(mongoURL, function(){
			company.findOne({"name" : name}, function(err, user){
				if(err){
					res.send({"status_code" : 500});
				}
				else if(!user){
					res.send({
						"status_code" : 403,
						"error_message" : "Comapny Doesn't exist"
					});
				}
				else{
					company.remove({"name":name}, function(removeErr, removeResult){
						if(removeErr){
							res.send({"status_code" : 500});
						}
						else{
							res.send({
								"status_code" : 200,
							});
						}
					});
				}
			});
		})
	}
	else{
		res.send({
			"status_code" : 401,
			"error_message": "Unauthorized"
		})
	}
};

//API to update the company in database by admin
exports.adminUpdateCompany = function(req, res){
	if(req.session.userDetails.admin){
		var _id = req.body._id;
		var name = req.body.name;
		var num_employees = req.body.num_employees;
		var year_founded = req.body.year_founded;
		var contact_name = req.body.contact_name;
		var contact_email = req.body.contact_email;
		var rankings = {
				"financials" : req.body.rankings.financials,
				"team" : req.body.rankings.team,
				"idea" : req.body.rankings.idea
		};
		
		var companyDetails = {
				"name" : name,
				"num_employees" : num_employees,
				"year_founded" : year_founded,
				"contact_name" : contact_name,
				"contact_email" : contact_email,
				"rankings" : rankings
		};
		var company = mongo.collection('companies');
		mongo.connect(mongoURL, function(){
			company.findOne({$or : [{"_id" : ObjectId(_id)} , { "name" : name}]}, function(err, user){				//find if company with similar ID or name exists or not
				if(err){
					res.send({
						"status_code" : 500
					});
				}
				else if(!user){
					res.send({
						"status_code": 403,
						"error_message": "company doesn't exist"
					})
				}
				else{
					company.update({"_id" : ObjectId(_id)}, {$set: companyDetails}, function(updateErr,updateResult){
						if(updateErr){
							res.send({
								"status_code" : 500
							});
						}
						else {
							res.send({
								"status_code" : 200,
							});
						}
					});
				}
			});
		});
	}
	else{
		res.send({
			"status_code" : 401,
			"error_message": "Unauthorized"
		})
	}
};

//API to retrieve company details by user
exports.userRetrieveCompanyDetails = function(req, res){
	if(!req.session.userDetails.admin){
		var name = req.param('name');
		var company = mongo.collection('companies');
		mongo.connect(mongoURL, function(){
			company.findOne({"name":name}, function(err, user){
				if(err){
					res.send({
						"status_code": 500
					});
				}
				else if(user){
					res.send({
						"status_code": 200,
						"company": JSON.stringify(user)
					});
				}
				else{
					res.send({
						"status_code": 403,
						"error_message": "Company Doesn't exist!"
					});
				}
			});
		});
	}
	else{
		res.send({
			"status_code" : 401,
			"error_message": "Unauthorized"
		})
	}
};

//API to retrieve top n companies by given category by user
exports.userRetrieveCmpnyDtlsRankWise = function(req, res){
	if(!req.session.userDetails.admin){
		var numberOfCompanies = Number(req.param('numberOfCompanies'));
		var rankingCategory = "rankings." + req.param('rankingCategory');
		var company = mongo.collection('companies');
		mongo.connect(mongoURL, function(){
			company.find().sort({rankingCategory : 1}).limit(numberOfCompanies).toArray(function(err,companies){
				if(err){
					res.send({
						"status_code": 500
					});
				}
				else{
					res.send({
						"status_code": 200,
						"Companies list Rank wise" : companies
					});
				}
			});
		});
	}
	else{
		res.send({
			"status_code" : 401,
			"error_message": "Unauthorized"
		})
	}
};

//API to logout
exports.logout = function(req, res){
	if(req.session.userDetails){
		res.send({"status_code" : 200});
		req.session.destroy();
	}
	else
		res.send({"status_code" : 500})
};