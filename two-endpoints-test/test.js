(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        // Schema for Completion
        let completionCols = [
            {
                id: "unitid",
                alias: "ID",
                dataType: tableau.dataTypeEnum.int
            }, 
            {
                id: "year",
                alias: "Year",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "fips",
                alias: "Fips",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "cipcode",
                alias: "CIP Code",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "award_level",
                alias: "Award Level",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "majornum",
                alias: "Major Number",
                dataType: tableau.dataTypeEnum.int
            },
            {
                id: "sex",
                alias: "Sex",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "race",
                alias: "Race",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "awards",
                alias: "Awards",
                dataType: tableau.dataTypeEnum.string
            }
        ];

        let completionTable = {
            id: "completions",
            alias: "Institution Completions",
            columns: completionCols
        };

        // Schema for Institution/College
        let institutionCols = [
            {
                id: "unitid",
                alias: "ID",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "inst_name",
                alias: "Institution Name",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "address",
                alias: "Address",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "region",
                alias: "Region",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "inst_control",
                alias: "Intitution Control",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "hbcu",
                alias: "HBCU",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "tribal_college",
                alias: "Tribal College",
                dataType: tableau.dataTypeEnum.int,
            }
        ];
        
        let institutionTable = {
            id: "institution",
            alias: "Institution",
            columns: institutionCols
        };
        schemaCallback([completionTable, institutionTable]);
    };
    console.log('testing-v1');
    // Download the data
    myConnector.getData = function(table, doneCallback){
        var dateObj = JSON.parse(tableau.connectionData),
            dateString = dateObj.yearRequested;
        console.log('testing-v2');
        // Branch logic based on the table ID
        switch(table.tableInfo.id) {
            case 'completions':
                console.log('testing-v6');
                //Manually handle asynchronicity
                apiCall = `https://educationdata.urban.org/api/v1/college-university/ipeds/completions-cip-2/${dateString}/`;
                console.log(`api1: ${apiCall}`);
                $.getJSON(apiCall, function (data){
                    var feat = data.results,
                        tableData = [];

                    var i = 0;
                    // Iterate over the JSON object
                    if (table.tableInfo.id == "completions") {
                        for (var i = 0, len = feat.length; i < len; i++) {
                            
                            tableData.push({
                            "unitid": feat[i].unitid,
                            "year": feat[i].year,
                            "fips": feat[i].fips,
                            "cipcode": feat[i].cipcode,
                            "award_level": feat[i].award_level,
                            "majornum": feat[i].majornum,
                            "sex": feat[i].sex,
                            "race": feat[i].race,
                            "awards": feat[i].awards,
                            });
                            
                        }
                    }
                    table.appendRows(tableData);
                    doneCallback();
                });
                
                break;
                
            case 'institution':
                apiCall = `https://educationdata.urban.org/api/v1/college-university/ipeds/directory/${dateString}/`;
                console.log(`api2: ${apiCall}`);
                $.getJSON(apiCall, function(data){
                    var feat = data.results,
                        tableData = [];
                    
                    var i = 0;

                    // Iterate over the JSON object
                    if (table.tableInfo.id == "institution") {
                        for (var i = 0, len = feat.length; i < len; i++) {
                            tableData.push({
                            "unitid": feat[i].unitid,
                            "inst_name": feat[i].inst_name,
                            "address": feat[i].address,
                            "region": feat[i].region,
                            "inst_control": feat[i].inst_control,
                            "hbcu": feat[i].hbcu,
                            "tribal_college": feat[i].tribal_college,
                            });
                        }
                    }
                    table.appendRows(tableData);
                    doneCallback();
                });
                break;
        };
    };

    tableau.registerConnector(myConnector);
    console.log('testing-v3');
    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            var dateObj = {
                yearRequested: $('#year').val().trim(),
            };
            console.log('testing-v4');
            if (dateObj.yearRequested) {
                tableau.connectionData = JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Test feed from two different endpoints"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
                console.log('testing-v5');
            } else {
                $('#errorMsg').html("Enter a valid year. For example, 2018.");
            }
            console.log('testing-v6');
        });
    });
})();