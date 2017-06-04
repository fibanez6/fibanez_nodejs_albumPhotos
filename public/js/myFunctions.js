function uniqId() {
    return Math.round(new Date().getTime() + (Math.random() * 100));
}

bootstrap_alert = function(alert, message) {
    var id = alert.toLowerCase()+"-alert_"+uniqId();
    var type = ("Danger" === alert) ? "Error" : alert;
    $('#alert_placeholder').append(
        '<div class="row">' +
        '   <div id="'+id+'" role="alert" class="alert alert-'+alert.toLowerCase()+' alert-dismissible pull-right">' +
        '       <button type="button" data-dismiss="alert" aria-label="Close" class="btn-noborder">' +
        '           <span aria-hidden="true">×' +
        '           </span><strong>'+type+'! </strong> ' + message +
        '       </button>' +
        '   </div>' +
        '</div>'
    );
    $("#"+id).alert();
    $("#"+id).fadeTo(2000, 500).slideUp(500, function(){
        $("#"+id).alert('close');
    });
};

bootstrap_alert.success = function(message) {
    bootstrap_alert("Success", message);
};
bootstrap_alert.info = function(message) {
    bootstrap_alert("Info", message);
};
bootstrap_alert.warning = function(message) {
    bootstrap_alert("Warning", message);
};
bootstrap_alert.danger = function(message) {
    bootstrap_alert("Danger", message);
};


function fajax(url, data, success) {
    $.ajax({
        url: url,
        type: 'POST',
        cache: false,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: success,
        error: function (err) {
            console.log(err);
            if (err) {
                if (err.responseJSON && err.responseText)
                    bootstrap_alert.danger(err.status+": "+$.parseJSON(err.responseText).message);
                else if (err.responseText !== "")
                    bootstrap_alert.danger(err.statusText);
                else
                    bootstrap_alert.danger("There was an unexpected error");
            }
        }
    });
};

function deleteAjax(url, data, success) {
    $.ajax({
        url: url,
        type: 'DELETE',
        cache: false,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: success,
        error: function (err) {
            console.log(err);
            if (err) {
                if (err.responseJSON && err.responseText)
                    bootstrap_alert.danger(err.status+": "+$.parseJSON(err.responseText).message);
                else if (err.responseText !== "")
                    bootstrap_alert.danger(err.statusText);
                else
                    bootstrap_alert.danger("There was an unexpected error");
            }
        }
    });
};
