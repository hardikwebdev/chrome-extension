/**
 * Settings Storage
 * 
 * The user settings are stored in the chrome storage and are synced between browsers
 * where sync is enabled.
 *
 * When the save button is clicked, all current values are stored to the chrome storage.
 * When the cancel button is clicked, the current values are overwritten by the last
 * that were saved.
 *
 * Values from the storage can be passed to a callback via get(key, callback)
 */
let base_url = "https://GiftMeregistry.com/api/v1";
function scrapeThePage() {
    // Keep this function isolated - it can only call methods you set up in content scripts
    var htmlCode = document.documentElement.outerHTML;
    return htmlCode;
}

var Sett = async function (jQuery) {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      // console.log(document.documentElement.outerHTML);
      var html  = "<table class='table'>";
          html+="<tr><th>Page Title</th><td>"+tab.title+"</td></tr>";
          html+="<tr><th>URL</th><td>"+tab.url+"</td></tr>";
          var html1 ="";
      const scraped = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: scrapeThePage,
      });
      var parser = new DOMParser();
	    var doc = parser.parseFromString(scraped[0].result, 'text/html');
      var x = doc.getElementsByTagName("meta");
      for (i = 0; i < x.length; i++) {
        if((x[i].name == undefined || x[i].name =="") && x[i].attributes[0].value!=undefined){
            html+="<tr><th>"+x[i].attributes[0].value+"</th><td>"+x[i].content+"</td></tr>";
        }else{
            html+="<tr><th>"+x[i].name+"</th><td>"+x[i].content+"</td></tr>";
        }
      }
      html+="</table>";
    jQuery('.box-body').html(html);
};

var GetProductSettings = async function (email,id,hide = '') {
  var html = '';
  if(email != ''){
    chrome.storage.local.get(['apitoken','token', 'user_info'], function(result) {

      jQuery.ajax({
            url:base_url+"/get-product-list",
            type:"POST",
            async:false,
            headers: { Authorization: resultToken},
            data:{
                email:email,
                registry_id:id,
            },
            success:function(response){
                if(response.status == 'success' && response.code == 200 ){
                    html+="<h2 class='text-navy-dark mx-3 mb-3'>Product</h2>";
                    html+="<input type='hidden' class='registryID' value="+id+">";
                    $array = response.data;
                    for (var key in $array) {
                      html += '<div class="row bg-nude-light mx-3 mt-2 cursor-pointer">';
                        html += '<div class="col-auto p-2">';
                          html += '<div class="img-col">';
                          html += '<img src="'+$array[key]["image"]+'" class="img-fluid">';
                          html += '</div>';
                        html += '</div>';
                        html += '<div class="col">';
                          html += '<div class="title-description text-navy-dark mt-3">';
                            html += '<h4 class="mb-2 title-readmore">'+$array[key]["name"]+'</h4>';
                            html += '<p class="mb-2 description-readmore">'+$array[key]["description"]+'</p>';
                            html += '<h6 class="price font-weight-bold">$ '+$array[key]["price"]+'</h6>';
                          html += '</div>';
                        html += '</div>';
                      html += '</div>';
                    }
                }else{
                  chrome.runtime.sendMessage({ message: 'logout' },
                      function (response) {
                          if (response === 'success'){
                            jQuery('.welcome-text').addClass('d-none');
                            jQuery('.append-code').load('./popup-sign-in.html');
                          }
                      }
                  );
                }
            },
            error:function(error){  
              // console.log(error);
              
                chrome.runtime.sendMessage({ message: 'logout' },
                  function (response) {
                      if (response === 'success'){
                        jQuery('.welcome-text').addClass('d-none');
                        jQuery('.append-code').load('./popup-sign-in.html');
                      }
                  }
              );
            }
      });
      html+="</table>";
      jQuery('.product-list').html(html);
      jQuery('.registry-back').show();
      if(hide == ''){
        jQuery('.product-list-show').show();
      }else{
        jQuery('.product-list-show').hide();
      }
      jQuery('.product-list').show();
      jQuery('.registry-list').hide();
      jQuery('.loader-full').hide();
    });

  }
};


var getFormDetect = async function (id) {
  var html = '';
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const scraped = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: scrapeThePage,
  });

  var parser = new DOMParser();
  var doc = parser.parseFromString(scraped[0].result, 'text/html');
  var x = doc.getElementsByTagName("meta");
  var  title = description= imgSrc= '';
  for (i = 0; i < x.length; i++) {
    if((x[i].name != undefined && x[i].name =="title") && x[i].content != undefined){
      title = x[i].content;
    }if((x[i].name != undefined && x[i].getAttribute('property') =="og:title") && x[i].content != undefined && title == '' ){
      title = x[i].content;
    }else if((x[i].name != undefined && x[i].name =="description") && x[i].content != undefined){
      description = x[i].content;
    }else if((x[i].name != undefined && x[i].getAttribute('property') =="og:description") && x[i].content != undefined  && title == '' ){
      description = x[i].content;
    }else if((x[i].name != undefined && x[i].name =="twitter:image") && x[i].content != undefined){
      imgSrc = x[i].content;
    }else if((x[i].name != undefined && x[i].getAttribute('property') =="og:image") && x[i].content != undefined){
      imgSrc = x[i].content;
    }
  }
  
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    jQuery('.item_url').val(tabs[0].url);
  });
  var registryId = jQuery('.get-registry-id').val();
  
  jQuery('.registry-id').val(id);
  jQuery('.title').val(title);
  jQuery('.description').val(description);
  jQuery('.price').val('');
  jQuery('.img_src').val(imgSrc);
};


var saveProduct =  async function (email,data) {
  var html = '';
  // alert(window.location.href)
  jQuery('.loader-full').show();
  chrome.storage.local.get(['apitoken','token', 'user_info'], function(result) {
    resultToken =  (typeof result.apitoken !== undefined)  ? result.apitoken : '' ;
   
    if(email != ''){
      jQuery.ajax({
            url:base_url+"/save-product",
            type:"POST",
            async:false,
            headers: { Authorization: resultToken},
            data:{
              item_url:data.item_url,
              item_name:data.title,
              item_description:data.description,
              item_price:data.price,
              email:email,
              item_image_url:data.img_src,
              token:resultToken,
              registry_id:data.registryID,
            },
            success:function(response){
                if(response.status == 'success' && response.code == 200 ){
                  jQuery('.back-product').attr('data-registerId',data.registryID );
                  // GetProductSettings(email,data.registryID );
                  jQuery('.product-form').hide();
                  jQuery('.thankyou-page').show();
                  // jQuery('.product-form').hide();
                  // jQuery('.product-list-show').hide();
                }else if(response.code == 400 ){
                  if(response.message ){
                    jQuery('.add-error-form').remove();
                    jQuery('.form-error').append('<div class="add-error-form error-text">'+response.message+'</div>');
                  }
                }
            },
            error:function(error){  
              // console.log(error);
               chrome.runtime.sendMessage({ message: 'logout' },
                      function (response) {
                          if (response === 'success'){
                            jQuery('.welcome-text').addClass('d-none');
                            jQuery('.append-code').load('./popup-sign-in.html');
                          }
                      }
                  );
            }
      });
      
      jQuery('.product-list-show').hide();
      jQuery('.loader-full').hide();
    }
  });
};

/**
 * Check Image Exists or not
 */
function checkIfImageExists(url, callback) {
  const img = new Image();
  img.src = url;

  if (img.complete) {

    callback(true);
  } else {
    img.onload = () => {
      callback(true);
    };
    
    img.onerror = () => {
      callback(false);
    };
  }
}

var Settings = function (jQuery, form) {
  var $ = jQuery;
  var $settings = $(form);
  // Save and sync all settings
  var save = function () {
    var options = {};
    // Processing all text and select inputs
    $('input[type="text"], select', $settings).each(function (index, item) {
      options[$(item).attr('name')] = $(item).val();
    });
    // Processing radio inputs
    $('input[type="radio"]', $settings).each(function (index, item) {
      if ($(item).is(":checked")) {
        options[$(item).attr('name')] = $(item).val();
      }
    });
    // Processing all checkboxes
    $('input[type="checkbox"]', $settings).each(function (index, item) {
        options[$(item).attr('name')] = ($(item).is(":checked")) ? true : false;
    });
    // Syncing the data with the storage
    chrome.storage.sync.set(options, function () {
      console.log('Saved the settings');
    });
  };

  // Initialize the settings
  function is_user_signed_in() {
    return new Promise(resolve => {
        chrome.storage.local.get(['token', 'user_info'],
            function (response) {
                if (chrome.runtime.lastError) resolve({ token: 
                    false, user_info: {} })
            resolve(response.token === undefined ?
                    { token: false, user_info: {} } :
                    { token: response.token, user_info: 
                    response.user_info }
                    )
            });
    });
  }
  var initialize = function () {
    is_user_signed_in()
        .then(res => {
            if (res.token) {
                if (typeof return_session === 'undefined') {
                  return_session = false;
                }
                
                if (res.token) {
                  jQuery('.welcome-text').removeClass('d-none');
                 
                  nameAdd(res.user_info.email);
                  getRegistry(res.user_info.email);
                  return_session = false
               
                } else {
                  jQuery('.append-code').load('./popup-sign-out.html');
                   
                }
            } else {
              jQuery('.welcome-text').addClass('d-none');
              jQuery('.append-code').load('./popup-sign-in.html');
           
            }
        })
        .catch(err => console.log(err));
  };

  // Pass a value by its key to a callback function
  this.get = function (key, callback) {
    var value = chrome.storage.sync.get(key, function (e) {
      callback(e[key]);
    });
  }

  jQuery('.product-list-show').hide();
  // Action when the save button is clicked
  $('.save-settings').click(function (e) {
    e.preventDefault();
    $('.box-body').html('');
    Sett($);
    save();
  });
  // Action when the save button is clicked
  $('.login-popupopen').click(function (e) {
    e.preventDefault();
    jQuery('.loader-full').show();
    initialize();
  });
  // Action when the cancel button is clicked
  $('.cancel-settings').click(function (e) {
    e.preventDefault();
    initialize();
  });
  var email =  '';
  let resultToken = '';
  chrome.storage.local.get(['apitoken','token', 'user_info'], function(result) {
    email =  (typeof result.user_info.email !== 'undefined')  ? result.user_info.email : '' ;
    resultToken =  (typeof result.apitoken !== undefined)  ? result.apitoken : '' ;
  });
  initialize();
  jQuery('.loader-full').hide();
  
  jQuery('.registry-back').hide();
  
  jQuery('.product-list-show').hide();
  $(document).on('click', '.get-registry-id', function (e) {
    e.preventDefault();
    jQuery('.loader-full').show();
    var id = $(this).attr('data-id');
    jQuery('.detect-product').attr('data-id',id);
    GetProductSettings(email,id);
  });
  $(document).on('click', '.back-product', function (e) {
    e.preventDefault();
    jQuery('.loader-full').show();
    var id = $(this).attr('data-registerId');
    jQuery('.detect-product').attr('data-id',id);
    jQuery('.thankyou-page').hide();
    GetProductSettings(email,id);
  });

  $(document).on('click', '.detect-product', function (e) {
    e.preventDefault();
    jQuery('.loader-full').show();
    jQuery('.registry-list').hide();
    jQuery('.product-list').hide();
    jQuery('.product-form').show(100); 
    
    var id = $(this).attr('data-id');
    getFormDetect(id);
    jQuery('.registry-list').hide();
    jQuery('.loader-full').hide();
  });
  
  $(document).on('click', '.saveProduct', function (e) {
    e.preventDefault();
    jQuery('.loader-full').show();
    var data = []; 

    data.item_url = $(this).closest('.product-save').find('.item_url').val();
    data.title = $(this).closest('.product-save').find('.title').val();
    data.registryID = $(this).closest('.product-save').find('.registry-id').val();
    data.description = $(this).closest('.product-save').find('.description').val();
    data.price = $(this).closest('.product-save').find('.price').val() ;
    
    data.img_src = $(this).closest('.product-save').find('.img_src').val();
    saveProduct(email,data);
    
  });
  
};


async function flip_user_status(signIn, user_info) {
    if (signIn) {
        return fetch(base_uri+'login', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`)
            },
            async:false,
            body: JSON.stringify({email:user_info.email , password:user_info.pass}),
        })
            .then(res => {
                return new Promise(resolve => {
                    if (res.status !== 200){
                      resolve('fail')
                    } else{
                      res.json().then(function(data) {
                        if(data.code === 200){
                          chrome.storage.local.set({ apitoken : data.token, token: signIn, user_info }, async function (response) {
                            if (chrome.runtime.lastError) resolve('fail');
  
                              user_signed_in = signIn;
                              resolve('success');
                          });
                        }else{
                          resolve('fail')
                        }
                      });
                    }
                })
            })
            .catch(err => console.log(err));
    } else if (!signIn) {
        return new Promise(resolve => {
            chrome.storage.local.get(['token', 'user_info'], function (response) {
                if (chrome.runtime.lastError) resolve('fail');
    
                if (response.token === undefined) resolve('fail');
    
                fetch(base_uri+'logout', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + btoa(`${response.user_info.email}:${response.user_info.pass}`)
                    }
                })
                    .then(res => {
                        if (res.status !== 200) resolve('fail');
    
                        chrome.storage.local.set({ token: signIn, user_info: {} }, function (response) {
                            if (chrome.runtime.lastError) resolve('fail');
    
                            user_signed_in = signIn;
                            resolve('success');
                        });
                    })
                    .catch(err => console.log(err));
            });
        });
    } 
}

function is_user_signed_in() {
    return new Promise(resolve => {
        chrome.storage.local.get(['token', 'user_info'],
            function (response) {
                if (chrome.runtime.lastError) resolve({ token: 
                    false, user_info: {} })
            resolve(response.token === undefined ?
                    { token: false, user_info: {} } :
                    { token: response.token, user_info: 
                    response.user_info, return_session: 
                    true }
                    )
            });
    });
}
// add to the 'chrome.runtime.onMessage.addListener()' routes...
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        flip_user_status(true, request.payload)
            .then(res => sendResponse(res))
            .catch(err => console.log(err));
        return true;
    } else if (request.message === 'logout') {
        flip_user_status(false, null)
            .then(res => sendResponse(res))
            .catch(err => console.log(err));
        return true;
    } else if (request.message === 'token') {
        is_user_signed_in()
            .then(res => sendResponse(res))
            .catch(err => console.log(err));
    }
});
