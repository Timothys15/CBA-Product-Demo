function updateTextArea(data) {
    var docNum = 1;
    const { _id, model_id, plain_text, tokenized_text } = data;

    var builtText = "";
    tokenized_text.forEach(element => {
        if (/^[.]*$/.test(element._id)) {
            builtText += (element._id + " ");
        } else {
            if (element.value === "PERSON") {
                builtText += ` <i style='background-color:yellow;'>${element.id}</i>`
            } else if (element.value === "ORGANIZATION") {
                builtText += ` <i style='background-color:blue;'>${element.id}</i>`
            } else if (element.value === "LOCATION") {
                builtText += ` <i style='background-color:red;'>${element.id}</i>`
            } else {
                builtText += (" " + element.id);
            }
        }
    });

    result =
        //TODO: change this all to appending to the DOM instead of hard coded
        `<div> 
                    <h4 class="text-center" id="docName" value=${_id}>${model_id}</h4>
                    <br />
                    <p id="textDisplayed">${builtText}</p>
                </div>`;
    document.getElementById('documentTextArea').innerHTML = result;
}

function match() {
    
    var data = {
        docID: document.getElementById("docName").getAttribute("value"),
        docName: document.getElementById("docName").innerHTML,
        word: document.getElementById("word").value,
        value: document.getElementById("entitySelect").value,
    }

/*     var temp = document.getElementById('textDisplayed').innerText;
    console.log(temp);
    console.log(temp.indexOf(data.word));
    console.log(temp[temp.indexOf(data.word)]); */

    var postDataUrl = '/update/entity/'+data.docID+'/'+data.word+'/'+data.value;
    $.ajax({
        url: postDataUrl,
        type: 'POST',
        data: data,
        dataType: 'JSON',
        success: (result) => {   
            console.log(result);
            getDoc(data.docID);
        }
    });
}

function getDocuments() {
    $.ajax({
        url: 'getAllDocuments',
        type: 'GET',
        dataType: 'JSON',
        success: (data) => {
            const theTable = document.getElementById("documentTable");
            const ButtonText = "Go";

            data.forEach(element => {
                var newRow = document.createElement("tr");
                var newDocNameCol = document.createElement("th");
                var docName = document.createTextNode(element.model_id);
                newDocNameCol.appendChild(docName);
                newRow.appendChild(newDocNameCol);

                var newButtonNameCol = document.createElement("th");
                var newButton = document.createElement("button");
                newButton.innerHTML = ButtonText;
                newButton.id = "docButt";
                newButton.setAttribute("value", element._id);
                newButtonNameCol.appendChild(newButton);
                newRow.appendChild(newButtonNameCol);

                theTable.appendChild(newRow);
            })
        }
    });
}

$(function() {
    $(document).on("click", '#docButt[value]', function() {
        getDoc(this.value);
    });
});

function getDoc(doc) {
    console.log("here")
    var getDataUrl = "document/" + doc;
    $.ajax({
        url: getDataUrl,
        type: 'GET',
        dataType: 'JSON',
        success: (data) => {
            updateTextArea(data);
        }
    });
}