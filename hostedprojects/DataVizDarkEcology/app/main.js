// UNSOLVED ISSUE : OUTER CIRCLE MISLOCATED UPON FIRST OPENNING. NEEDS REFRESHING BROWSWER TO HAVE THE CORRECT LOCATION. 


//--------------
//CREATE GLOBALS
// ---------------
var FACount;
var maxWidth = Math.max(600, Math.min(screen.height, screen.width) - 250);
var outerRadius = maxWidth / 2,
    innerRadius = outerRadius - 120,
    bubbleRadius = innerRadius - 50,
    nodesTranslate = (outerRadius - innerRadius) + (innerRadius - bubbleRadius) + 100;
linkRadius = innerRadius - 20;


var svg = d3.select(document.getElementById("mainDiv"))
    .style("width", (outerRadius * 2 + 200) + "px")
    .style("height", (outerRadius * 2 + 200) + "px")
    .append("svg")
    .attr("id", "svg")
    .style("width", (outerRadius * 2 + 200) + "px")
    .style("height", (outerRadius * 2 + 200) + "px")
    .style("background-color", "white");

//SVG(center)
var nodesSvg = svg.append("g")
    .attr("class", "nodes")
    .attr("transform", "translate(" + nodesTranslate + "," + nodesTranslate + ")");
//SVG(peripheral)
var periSvg = svg.append("g")
    .attr("class", "peri")
    .attr("transform", "translate(" + nodesTranslate + "," + nodesTranslate + ")");

//Pack nodes
var bubble = d3.layout.pack()
    .sort(null)
    .size([bubbleRadius * 2, bubbleRadius * 2])
    .padding(1.5)
    .value(function (d) {
        return d.size;
    });

//Information Board 
var toolTip = d3.select(document.getElementById("toolTip"));
var projectName = d3.select(document.getElementById("projectName"));
var projectDescription = d3.select(document.getElementById("projectDescription"));
var link = d3.select(document.getElementById("link"));

//-----------
//INITIALIZE/DRAWING
//-----------


// 1. Draw Nodes (Center)

var FAData;
var nodeXArray = [];
var nodeYArray = [];
var nodesTranslateXValues = []; //the [0] contains the transform data of the very center node -- used for drawing outer cicle so that they translate dynamically. Previously the outer circle's translate data was hard-coded. 

//function to draw  nodes
function drawCenter() {
    //console.log(root);
    var node = nodesSvg.datum(FAData).selectAll(".node")
        .data(bubble.nodes)
        .enter().append("g")
        .attr("transform", function (d) {
            nodesTranslateXValues.push(d.x);
            // console.log(nodesTranslateXValues); 

            return "translate(" + d.x + "," + d.y + ")";
        });
    //Assign attr to each nodes except for center node
    node.filter(function (d) {
            return !d.children;
        }).append("circle")
        //Mark baselevel to make it transparent (CSS) 
        .attr("class", function (d) {
            return d.children ? "baseLevel" : "FocusArea";
        })
        .attr("r", function (d) {
            //console.log(d);
            nodeXArray.push(d.x);
            nodeYArray.push(d.y);
            return d.r;
        })
        .attr("fill", function (d) {
            return "red";
        })
        .attr("opacity", "0.2")
        //assign id to each focus area
        .attr("id", function (d) {
            return d.FIELD1;
        })
        .on("mouseover", function (d) {
            mouseOverFA(d);
        })
        .on("mouseout", function (d) {
            mouseOutFA(d);
        })

    ;
    //Marking Center Node
    node.filter(function (d) {
        return d.children;
    }).attr("id", function (d) {

        return "thisIsTheCenter";

    });

    //Adding text to nodes
    node.filter(function (d) {
            return !d.children;
        }).append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("font-size", function (d) {
            return d.r / 3.3;
        })
        .style("opacity", "0.2")
        //assign id to each text
        .attr("id", function (d) {
            return "C" + d.FIELD1;
        })
        .text(function (d) {
            return d.FIELD1.substring(0, d.r / 2);
        })
        .style("pointer-events", "none");

}

//read Focus Area data and draw center
d3.json("app/FA counts.json", function (err, root) {
    FAData = root;
    drawCenter();
    
    d3.json("app/project.json", function (err, root) {
    //console.log(root)
    projectData = root;
    //console.log(projectData);
    drawOuterCircle();
    // drawLinks(); 
});

});



//2. Draw Circles Directly as Peripheral Nodes 
//   Assign Properties to circles using FA data 

var totalPeriNum = 42;
var transAngleEach = 2 * Math.PI / totalPeriNum; //this line calculates how much angle to rotate for each node on the outside. 
var packR = 180; //radius of the outer circle
var projectData;

function drawOuterCircle() {

    // console.log(projectData); 
    //Satellite nodes
    var satNode = periSvg.selectAll(".peri")
        .data(projectData.children)
        .enter().append("g")
        .attr(
            "transform", "translate(" + nodesTranslateXValues[0] + "," + nodesTranslateXValues[0] + ")" // to have the same center as the inside BaseLevel node which encompasses all other central nodes
        );

    satNode.append("circle")
        .attr("class", function (d) {
            return "PeriNode";
        })
        .attr("id", function (d) {
            return d.FIELD1;
        })
        .attr("cx", function (d) {

            var periX = packR * Math.cos(transAngleEach * d.num)
                //console.log(periX);
            return periX;
        })
        .attr("cy", function (d) {
            var periY = packR * Math.sin(transAngleEach * d.num)
                // console.log(periY);
            return periY;
        })
        .attr("r", function (d) {
            var periR = 6;
            return periR;
        })
        .attr("id", function (d) {
            return d.FIELD1
        })
        .attr("opacity", "0.2")
        .attr("fill", function (d) {
            return "rgb(50,180,255)";
        })
        .on("mouseover", function (d) {
            mouseOverProject(d);
        })
        .on("mouseout", function (d) {
            mouseOutProject(d);
        })
        .on("click", function(d){ 
           var hyperLink=d.FIELD21; 
           window.open(hyperLink);
    })
    
    ;

    satNode.append("text")
        .attr("class", "satText")
        .attr("dy", ".001em")
        .attr("id", function (d) {
            return "T" + d.FIELD1;
        })
        .attr("text-anchor", function (d) {
            if (d.num * transAngleEach <= Math.PI / 2 || d.num * transAngleEach > 3 / 2 * Math.PI) {
                return null;
            } else {
                return "end";
            }

        })
        .attr("transform", function (d) {
            //added "*180/Math.PI", then worked
            //???? decide where to add +/- 2 to have text aligned with circles    
            if (d.num * transAngleEach <= Math.PI / 2 || d.num * transAngleEach > 3 / 2 * Math.PI) {
                return "rotate(" + (d.num * transAngleEach * 180 / Math.PI) + ")" + "translate(" + (packR + 10) + ", +2)" + (d.num * transAngleEach > Math.PI / 2 && d.num * transAngleEach < 3 / 2 * Math.PI ? "rotate(180)" : "")
            } else {
                return "rotate(" + (d.num * transAngleEach * 180 / Math.PI) + ")" + "translate(" + (packR + 10) + ", -2)" + (d.num * transAngleEach > Math.PI / 2 && d.num * transAngleEach < 3 / 2 * Math.PI ? "rotate(180)" : "");
            }
        })
        .text(function (d) {
            return d.FIELD1;
        })
        .style("fill", function (d) {
            return "rgb(190,190,190)";
        })
        .style("font-size", "8px")
        .style("font-family", "Helvetica Neue")
        .on("mouseover", function (d) {
            mouseOverProject(d);
        })
        .on("mouseout", function (d) {
            mouseOutProject(d);
        });



}



//-------
//Interactions
//-------

function mouseOverFA(d) {
    var FARelatedProjects = _.compact(_.values(d).slice(2, 23));
    //console.log(FARelatedProjects);
    d3.select(document.getElementById(d.FIELD1))
        .transition()
        .attr("opacity", "0.35");

    for (var i = 0; i < FARelatedProjects.length; i++) {
        var targetProject = FARelatedProjects[i];
        var tempP = targetProject.toString();
        d3.select(document.getElementById(tempP))
            .transition()
            .attr("fill", function (d) {
                return "rgb(250,90,100)";
            })
            .attr("r", "8")
            .attr("opacity", "0.5");


        d3.select(document.getElementById("T" + tempP))
            .transition()
            .style("fill", function (d) {
                return "rgb(100,100,100)";
            })

        .style("font-size", function (d) {
            return "11px";
        });
        //console.log(tempP);
        //console.log(targetProject); 

    }


    d3.select(document.getElementById("C" + d.FIELD1))
        .transition()
        .style("font-size", function (d) {
            return "16px";
        })
        .style("opacity", "0.6")
        .text(function (d) {
            return d.FIELD1;
        })
}

function mouseOutFA(d) {
    var FARelatedProjects = _.compact(_.values(d).slice(2, 23));
    // console.log(FARelatedProjects);

    d3.select(document.getElementById(d.FIELD1))
        .transition()
        .attr("opacity", "0.2");

    for (var i = 0; i < FARelatedProjects.length; i++) {
        var targetProject = FARelatedProjects[i];
        var tempP = targetProject.toString();
        d3.select(document.getElementById(tempP))
            .transition()
            .attr("fill", function (d) {
                return "rgb(50,180,255)";
            })
            .attr("r", "6")
            .attr("opacity", "0.2");

        d3.select(document.getElementById("T" + tempP))
            .transition()
            .style("fill", function (d) {
                return "rgb(190,190,190)";
            })
            .style("font-size", function (d) {
                return "8px";
            });


        //console.log(tempP);
        //console.log(targetProject); 
    }


    //Central Text
    d3.select(document.getElementById("C" + d.FIELD1))
        .transition()
        .style("font-size", function (d) {
            return d.r / 3.3;
        })
        .style("opacity", function (d) {
            return "0.2";
        })
        .text(function (d) {
            return d.FIELD1.substring(0, d.r / 2);
        });

}

function mouseOverProject(d) {

    var ProjectRelatedFA = _.compact(_.values(d).slice(2, 19));
    //console.log(ProjectRelatedFA);

    d3.select(document.getElementById(d.FIELD1))
        .transition()
        .attr("opacity", "0.5");


    for (var i = 0; i < ProjectRelatedFA.length; i++) {
        var targetProject = ProjectRelatedFA[i];
        var tempPro = targetProject.toString();
        d3.select(document.getElementById(tempPro))
            .transition()
            .attr("opacity", "0.35")
            .attr("fill", function (d) {
                return "rgb(50,180,255)";
            });

        d3.select(document.getElementById("C" + tempPro))
            .transition()
            .style("font-size", function (d) {
                return "12px";
            })
            .style("opacity", "0.6")
            .text(function (d) {
                return d.FIELD1;
            });


        //console.log(tempP);
        //console.log(targetProject); 
    }

    //peri Text
    d3.select(document.getElementById("T" + d.FIELD1))
        .transition()
        .style("fill", function (d) {
            return "rgb(100,100,100)";
        })

    .style("font-size", function (d) {
        return "11px";
    });
    var ifOver = true;
    showInfo(d, ifOver);

}

function mouseOutProject(d) {

    var ProjectRelatedFA = _.compact(_.values(d).slice(2, 19));
    //console.log(ProjectRelatedFA);

    d3.select(document.getElementById(d.FIELD1))
        .transition()
        .attr("opacity", "0.2");


    for (var i = 0; i < ProjectRelatedFA.length; i++) {
        var targetProject = ProjectRelatedFA[i];
        var tempPro = targetProject.toString();
        d3.select(document.getElementById(tempPro))
            .transition()
            .attr("fill", "red")
            .attr("opacity", "0.2");

        d3.select(document.getElementById("C" + tempPro))
            .transition()
            .style("font-size", function (d) {
                return d.r / 3.3;
            })
            .style("opacity", function (d) {
                return "0.2";
            })
            .text(function (d) {
                return d.FIELD1.substring(0, d.r / 2);
            });


        //console.log(tempP);
        //console.log(targetProject); 
    }

    //peri Text
    d3.select(document.getElementById("T" + d.FIELD1))
        .transition()
        .style("fill", function (d) {
            return "rgb(190,190,190)";
        })
        .style("font-size", function (d) {
            return "8px";
        });

    var ifOver = false;
    showInfo(d, ifOver);

}


// Information Board
function showInfo(d, ifOver) {
    // console.log(d);
    var thisProject = d;
    var toolTipHeight; 
    //console.log(thisProject);
    if (ifOver === true) {
        

        projectName.text(function (d) {
                return thisProject.FIELD1;
            })
            .style("font-family", "Didot")
            .style("font-size", "15")
            .style("text-align", "center");
        projectDescription.text(function (d) {
                //console.log(thisProject);
                return thisProject.FIELD20;
            })
            .style("font-family", "PT Sans")
            .style("font-size", "12");
        
        
//        link.text(function (d) {
//                 return " ss"
//            })
//            .style("font-family", "PT Sans")
//            .style("font-size", "12");
        // PROBLEM OF THE "READ MORE" TEXT -- Cannot be clicked 
        //cuz the tooltip disapperas when mouse is moving toward the text.

        
        
        toolTip.transition()
            .duration(200)
            .style("opacity", "0.9");
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height", function(){ 
            //console.log(thisProject);
              var textLength= thisProject.FIELD20.length; 
             // console.log(textLength);
              var wordNum=thisProject.FIELD20.split(" ").length;
              var lines= Math.ceil(wordNum/7); 
              //console.log(lines);
               toolTipHeight= 40 +16*(lines+2) ;
               return toolTipHeight; 
            
        });

    } else {
        toolTip.transition()
            .duration(500)
            .style("opacity", "0");
    }


}



