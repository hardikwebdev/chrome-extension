    jQuery(document).ready(function(){
        var itemsArr = [];
        jQuery(document).on('click','#cele-sign-out',function() {
            chrome.runtime.sendMessage({ message: 'logout' },
                function (response) {
                    console.log(response);
                    if (response === 'success'){
                        jQuery('.append-code').load('./popup-sign-in.html');
                        jQuery('.loader-full').hide();
                        jQuery('.registry-list').hide();
                        jQuery('.product-list').hide();
                        jQuery('.product-form').hide();
                        jQuery('.welcome-text').addClass('d-none');
                        jQuery('.product-list-show').hide();
                    }
                }
            );
        });
    });