const button = document.querySelector('button');
button.addEventListener('mouseover', () => {
  
});

button.addEventListener('mouseleave', () => {
    
});
jQuery(document).ready(function(){
    jQuery(document).on('click','#celeb-login',function(event) {
      
        event.preventDefault();
        var  email = jQuery('#email').val();
        var pass = jQuery('#password').val();
        console.log(email +" asd  " + pass);
        jQuery('.append-code').append('');
        if(email === ''){
            jQuery('#email').addClass('error');
            jQuery('.email-error').html('<p class="error-text">Please Enter an email.</p>');
        }
        if(pass === ''){
            jQuery('#password').addClass('error');
            jQuery('.password-error').html('<p class="error-text">Please Enter a Password.</p>');
        }
        if (email == '' || pass == '') {
            jQuery('.loader-full').hide();
            return;
        }
        if (email && pass) {
            
            chrome.runtime.sendMessage({ message: 'login', payload: { email,    pass }},
                function (response) {
                    jQuery('.loader-full').hide();
                    if (response === 'success'){
                        window. location. reload();
                    }else{
                        jQuery('.addError').html('Email id or Password is not matched.');
                    }
                }
            );
        } else {
            jQuery('.loader-full').hide();

            jQuery('#email').addClass('error');
            jQuery('#password').addClass('error');
        }
    });
});