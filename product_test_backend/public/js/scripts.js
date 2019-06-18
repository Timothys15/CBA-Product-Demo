function updateTextArea(data) {
    var docNum = 1;
    const { _id, model_name, plain_text, tokenized_text } = data;

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
                    <h4 class="text-center" id="docId">${_id}</h4>
                    <br />
                    <p id="textDisplayed">${builtText}</p>
                </div>`;
    document.getElementById('documentTextArea').innerHTML = result;
}

function match() {
    console.log("here");
    console.log(document.getElementById("word").value);
    console.log(document.getElementById("entitySelect").value);
    console.log(document.getElementById("docId").innerHTML);
    var postDataUrl = 'update/5cf87d6cf1ad06089c56cdfa';
    var data = {
        id: document.getElementById("docId").innerHTML,
        word: document.getElementById("word").value,
        value: document.getElementById("entitySelect").value,
    }
    var temp = document.getElementById('textDisplayed').innerText;
    console.log(temp);
    console.log(temp.indexOf(data.word));
    console.log(temp[temp.indexOf(data.word)]);


    $.ajax({
        url: postDataUrl,
        type: 'POST',
        data: data,
        dataType: 'JSON',
        success: (data) => {
        }
    });
}

function getDocuments() {
    $.ajax({
        url: 'getAllDocuments',
        type: 'GET',
        dataType: 'JSON',
        success: (data) => {
            console.log(data);

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
        console.log(this.value);
        getDoc(this.value);
    });
});

function getDoc(doc) {
    var getDataUrl = "document/" + doc;
    console.log(getDataUrl);
    $.ajax({
        url: getDataUrl,
        type: 'GET',
        dataType: 'JSON',
        success: (data) => {
            updateTextArea(data);
        }
    });
}