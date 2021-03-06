var boatId
var boatTable

function getBoats() {
    $("#tableShowBoat").dataTable().fnDestroy();
    $("#formInputBoats").hide();
    $("#tableShowBoat").show();

    boatTable = $("#tableShowBoat").DataTable({
        ajax: {
            url: "api/boats",
            dataSrc: function (json) {
                        var return_data = new Array();
                        for (var i = 0; i < json.length; i++) {
                            return_data.push({
                                'id': json[i].id,
                                'boatNumber': json[i].boatNumber,
                                'type': json[i].type,
                                'chargingTime': json[i].chargingTime,
                                'numberOfSeats': json[i].numberOfSeats,
                                'minPrice': json[i].minPrice.toFixed(2),
                                'actualPrice': json[i].actualPrice.toFixed(2),
                                'blockStatus':json[i].blockStatus,
                                'deleteBtn': "<button class='btn btn-danger deleteButton' boatId=' " + json[i].id + " ' >delete</button>",
                                'editBtn': "<button class='btn btn-primary editBtn' boatId=' " + json[i].id + " '> edit </button>"
                            });
                        }
                        return return_data;
                    }
        },
        columns: [
            { data: "boatNumber" },
            { data: "type" },
            { data: "chargingTime" },
            { data: "numberOfSeats" },
            { data: "minPrice" },
            { data: "actualPrice" },
            { data: "blockStatus" },
            { data: "deleteBtn" },
            { data: "editBtn" }
        ],
        dom: "Bfrtip",
        buttons: [
            {
                text: "Add a boat",
                action: function (e, dt, node, config) {
                    var content = $("#formInputBoats").html();
                    $("#exampleModal .modal-body").html(content);
                    $("#exampleModal .modal-title").text("Boat Registration Form");
                    $("#exampleModal").modal("show");
                    $("#okDelModalBtn").hide();
                    $("#saveEdtModalBtn").hide();
                    $("#saveCrtModalBtn").show();
                },
            },
            {
                text: "Block a boat",
                action: function (e, dt, node, config) {
                    blockBoat();
                }
            },
            {
                text: "Unblock a boat",
                action: function (e, dt, node, config) {
                    unBlockBoat();
                }
            }
        ]
    });

    $("#saveCrtModalBtn").click(function () {
        var boatNumber = $("#boatNumberInput").val();
        if (!boatNumber) {
            alert('The boat number should be set..');
            return;
        }
        postBoat();
        $("#exampleModal").modal("hide");
    });

    $("#tableShowBoat tbody")
        .off()
        .on("click", "button.deleteButton", function () {
            $("#exampleModal").modal("show");
            $("#exampleModal .modal-body").text("Are you sure to delete this boat?");
            $("#exampleModal .modal-title").text("Delete Confirmation!");
            $("#okDelModalBtn").show();
            $("#saveEdtModalBtn").hide();
            $("#saveCrtModalBtn").hide();
            boatId = $(this).attr("boatId");
        });
    $("#okDelModalBtn").click(function () {
        console.log(boatId);
        deleteBoat(boatId);
        $("#exampleModal").modal("hide");
    });

    $("#tableShowBoat")
        .off()
        .on("click", "button.editBtn", function () {
            console.log(boatTable.row($(this).parents("tr")));
            var data1 = boatTable.row($(this).parents("tr")).data();

            $("#exampleModal").modal("show");
            var content = $("#formInputBoats").html();
            $("#exampleModal .modal-body").html(content);
            $("#exampleModal .modal-title").text("Boat Modification Form");
            $("#okDelModalBtn").hide();
            $("#saveEdtModalBtn").show();
            $("#saveCrtModalBtn").hide();

            document.getElementById("boatNumberInput").value = data1.boatNumber;
            document.getElementById("boatTypeInput").value = data1.type;
            document.getElementById("chargingTimeInput").value = data1.chargingTime;
            document.getElementById("maxSeatsInput").value = data1.numberOfSeats;
            document.getElementById("boatMinPriceInput").value = data1.minPrice;
            document.getElementById("boatActPriceInput").value = data1.actualPrice;
            boatId = data1.id;
        });
    $("#saveEdtModalBtn").click(function () {
        var boatNumber = $("#boatNumberInput").val();
        if (!boatNumber) {
            alert('The boat number should be set..');
            return;
        }
        changeBoat(boatId);
        $("#exampleModal").modal("hide");
    });
}

function postBoat() {
    var boat = {
        boatNumber: $("#boatNumberInput").val(),
        type: $("#boatTypeInput").val(),
        chargingTime: Number(($("#boatTypeInput").val() == "electrical") ? ($("#chargingTimeInput").val()):0),
        numberOfSeats: Number($("#maxSeatsInput").val()),
        minPrice: Number($("#boatMinPriceInput").val()),
        actualPrice: Number($("#boatActPriceInput").val())
    };
    var jsonObject = JSON.stringify(boat);

    $.ajax({
        url: "api/boats",
        type: "POST",
        contentType: "application/json",
        data: jsonObject,
        success: function (message) {
            alert(message);
            $("#boatNumberInput").val("");
            $("#boatTypeInput").val("");
            $("#chargingTimeInput").val("");
            $("#maxSeatsInput").val("");
            $("#boatMinPriceInput").val("");
            $("#boatActPriceInput").val("");
            boatTable.ajax.reload();
        },
        error: function () {
            alert("try again");
        }
    });
}

function deleteBoat(boatId) {
    $.ajax({
        url: "api/boats/" + boatId,
        type: "DELETE",
        success: function () {
            alert("The boat has been deleted!");
            boatTable.ajax.reload();
        },
        error: function () {
            alert("The boat cannot be deleted! Try to delete related trips first!");
        }
    });
}

function changeBoat(boatId) {
    var boat = {
            boatNumber: $("#boatNumberInput").val(),
            type: $("#boatTypeInput").val(),
            chargingTime: Number(($("#boatTypeInput").val() == "electrical") ? ($("#chargingTimeInput").val()):0),
            numberOfSeats: Number($("#maxSeatsInput").val()),
            minPrice: Number($("#boatMinPriceInput").val()),
            actualPrice: Number($("#boatActPriceInput").val())
        };
    var jsonObject = JSON.stringify(boat);

    $.ajax({
        url: "api/boats/" + boatId,
        type: "PUT",
        contentType: "application/json",
        data: jsonObject,
        success: function (message) {
            alert(message);
            boatTable.ajax.reload();
        },
        error: function () {
            alert("try again");
        },
    });
}
function blockBoat(){
    $("#formInputBlock").show();
    $("#blockBtn").html("Block");
    $("#blockBtn").click(function () {
        $("#formInputBlock").hide();
        $("#blockBtn").off();
        $("#blockCancelBtn").off();
        $.ajax({
            url: "api/boats/blocked/?boatNumber=" + document.getElementById("blockNumberInput").value +
                                    "&blockStatus=" + "blocked",
            type: "PUT",
            contentType: "application/json",
            success: function (message) {
                alert(message);
                boatTable.ajax.reload();
                $("#blockNumberInput").val("");
            },
            error: function () {
                alert("try again");
            },
        });

    });
    $("#blockCancelBtn").click(function () {
        $("#formInputBlock").hide();
        $("#blockBtn").off();
        $("#blockCancelBtn").off();
        $("#blockNumberInput").val("");
    });
}

function unBlockBoat(){
    $("#formInputBlock").show();
    $("#blockBtn").html("Unblock");
    $("#blockBtn").click(function () {
        $("#formInputBlock").hide();
        $("#blockBtn").off();
        $("#blockCancelBtn").off();
        $.ajax({
            url: "api/boats/blocked/?boatNumber=" + document.getElementById("blockNumberInput").value +
                                    "&blockStatus=" + "not blocked",
            type: "PUT",
            contentType: "application/json",
            success: function (message) {
                alert(message);
                $("#blockNumberInput").val("");
                boatTable.ajax.reload();
            },
            error: function () {
                alert("try again");
            },
        });

    });
    $("#blockCancelBtn").click(function () {
        $("#formInputBlock").hide();
        $("#blockBtn").off();
        $("#blockCancelBtn").off();
        $("#blockNumberInput").val("");

    });
}

$(document).ready(function () {
    getBoats();
});
