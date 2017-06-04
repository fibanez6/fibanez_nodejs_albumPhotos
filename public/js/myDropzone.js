/*
 Available via the MIT or new BSD license.
 http://www.dropzonejs.com/
 */
$(function() {

    var errors= [];
    var completed= [];

    var totalBytesToUpload= 0;
    //var successBytesUploaded= 0;
    var completedBytesUploaded= 0;
    var errorBytesInUpload= 0;

    function errorPercent() {
        if (totalBytesToUpload - errorBytesInUpload <= 0) {
            return 0;
        }
        return (errorBytesInUpload*100/totalBytesToUpload).toFixed(2);
    }

    function completedPercent() {
        if (totalBytesToUpload - completedBytesUploaded <= 0) {
            return 0;
        }
        return (completedBytesUploaded*100/totalBytesToUpload).toFixed(2);
    }

    function clearQueues() {
        errors= [];
        completed= [];
    }

    function removeClasses(progressbar) {
        progressbar.removeClass("progress-bar-striped");
        progressbar.removeClass("progress-bar-success");
        progressbar.removeClass("progress-bar-danger");
    }

    function updateTotalProgressValue(value,cptd,err) {
        var completedlist = cptd ? cptd : completed;
        var errlist = err ? err : errors;
        var divprogressbar = $('div[class="progress"]');
        var progressbar = $('div#total-progress');
        removeClasses(progressbar);
        progressbar.addClass("progress-bar-striped");
        progressbar.attr("aria-valuenow", value);
        progressbar.attr("style", "width: "+value+"%");
        progressbar.text(value+"%");
        if (value == 0) {
            divprogressbar.hide();
        } else if (value == 100) {
            divprogressbar.show();
            removeClasses(progressbar);
            if (errlist.length == 0) {
                showOkMsg(completedlist);
                progressbar.addClass("progress-bar-success");
            } else {
                showErrorMsg(errlist);
            }
        } else {
            divprogressbar.show();
        }
    }

    function showErrorMsg(err) {
        var progressbar = $('div#total-progress');
        removeClasses(progressbar);
        progressbar.text("Failured to upload " + err.length+" file"+(err.length > 1 ? "s" : ""));
        progressbar.addClass("progress-bar-danger");
    }

    function showOkMsg(completed) {
        var progressbar = $('div#total-progress');
        progressbar.text("Successfull. Upload " + completed.length+" file" +(completed.length > 1 ? "s" : ""));
    }

    myDropzone.on("addedfile", function (file) {
        console.log("addedfile -" + file.name);
        updateTotalProgressValue(0);
        clearQueues();
        totalBytesToUpload += file.size;
        $( ".data-shake" ).hover(
            function() {
                $( this ).next().addClass( "remove-shake" );
            }, function() {
                $( this ).next().removeClass( "remove-shake" );
            }
        );
    });

    myDropzone.on("removedfile", function (file) {
        console.log("removedfile -" + file.name);
        updateTotalProgressValue(0);
        clearQueues();
        totalBytesToUpload -= file.size;
        //file.previewElement.addEventListener("click", function() {
        //    myDropzone.removeFile(file);
        //});
    });

    // Update the total progress bar
    myDropzone.on("totaluploadprogress", function(progress) {
        var completed = completedPercent();
        console.log("totaluploadprogress - "+progress.toFixed(2) +"% error - "+ completed+ "%");
        if (progress > completed) {
            updateTotalProgressValue(progress.toFixed(2));
        } else {
            updateTotalProgressValue(completed);
        }
    });

    myDropzone.on("uploadprogress", function(file, progress, bytesSent) {
        console.log("uploadprogress - "+bytesSent+"/"+file.size+ "["+progress+"%]");
    });

    myDropzone.on("sending", function(file, xhr, formData) {
        console.log("sending - "+file.name + "["+file.size+"]");
    });

    myDropzone.on("success", function(file) {
        completed.push(file);
        //successBytesUploaded += file.size;
    });

    //myDropzone.on("canceled", function(file) {
    //    errorBytesInUpload += file.size;
    //});

    //Called when the upload was either successful or erroneous.
    myDropzone.on("complete", function(file, error) {
        console.log("complete - "+file.name);
        completedBytesUploaded += file.size;
        $(file.previewElement).find('.remove-image:first').remove()
        //completed.push(file);
        //showOkMsg(completed);
    });

    myDropzone.on("queuecomplete", function(file) {
        console.log("All files have uploaded ");
        updateTotalProgressValue(100);
        totalBytesToUpload = 0;
        //successBytesUploaded= 0;
        completedBytesUploaded= 0;
        errorBytesInUpload= 0;
    });

    myDropzone.on("error", function(file) {
        console.log("error - "+file.name);
        file.previewElement.addEventListener("click", function() {
            myDropzone.removeFile(file);
        });
        errorBytesInUpload += file.size;
        errors.push(file);
        showErrorMsg(errors);
    });

    /*
     Buttons
     */
    document.querySelector(".start").onclick = function() {
        myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
    };
    document.querySelector(".cancel").onclick = function() {
        myDropzone.removeAllFiles(true);
    };

});