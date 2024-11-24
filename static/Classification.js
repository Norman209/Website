

let originalImageWidth;
let originalImageHeight;
let image_ids = ['blur_sample_image', 'blur_normal_sample_image', 'rotate_normal_sample_image', 'rotate_sample_image', 'rotate_sample_image2','grayscale_sample_image','clockwise_sample_img','counter_clockwise_sample_img','upside_down_sample_img','vertical_flip_sample_img','horizontal_flip_sample_img','crop_sample_img','crop_sample_img2']

let folder_id = "id" + Math.random().toString(16).slice(2);
let input_ids = ['Flip_check_box', '90° rotate_check_box', 'Crop_checkbox', 'grayscale_checkbox', 'Rotate_checkbox', 'blur_checkbox', 'Expansion', 'grayscale_preprocess', 'resize_preprocess', 'submit'];
console.log('JAVASCRIPT STARTED');
window.onload = function () {
    console.log("Page has loaded!");
    // Your code here

};



let default_upload_option = 'folder'
function chunkDictionary(dict, chunkSize) {
    // Convert object to array of key-value pairs
    const entries = Object.entries(dict);

    // Initialize an empty array to store the chunks
    const chunks = [];

    // Iterate over the entries array and group into chunks
    for (let i = 0; i < entries.length; i += chunkSize) {
        // Slice the entries array to get a chunk of size 'chunkSize'
        const chunk = entries.slice(i, i + chunkSize);

        // Convert the chunk back to an object
        const chunkObject = Object.fromEntries(chunk);

        // Push the chunk object to the chunks array
        chunks.push(chunkObject);
    }

    return chunks;
}


function grayscale_preview_images() {
    let images = document.getElementsByClassName('sample_image')
    if (document.getElementById('grayscale_preprocess').checked) {
        for (i = 0; i < images.length; i++) {
                images[i].style.filter = 'grayscale(100%)'
        }
    }
    else {
        for (i = 0; i < images.length; i++) {
            if(images[i].id!=="grayscale_sample_image"){
                images[i].style.filter = 'grayscale(0%)'
            }
        }
    }
}

function resize_preview_images(){
    let images = document.getElementsByClassName('sample_image')
    if (document.getElementById('resize_preprocess').checked) {
        document.getElementById("resize_preprocess_pop_up").style.display = "block"
        for (i = 0; i < images.length; i++) {
                // images[i].style.filter = 'grayscale(100%)'

                // images[i].style.width = 
                // images[i].style.height =  

        }
    }
    else {
        document.getElementById("resize_preprocess_pop_up").style.display = "none"
        for (i = 0; i < images.length; i++) {
            document.getElementById(image_ids[i]).style.width = 15*imageWidthToHeightRatio+"vw";
            document.getElementById(image_ids[i]).style.height = 15*imageHeightToWidthRatio+"vw";
        }
    }

}

async function change_all_preview_images(pre_proccessing_option) { //this function changes the preview images based on chosen pre-proccessing options
    let checkbox_id = pre_proccessing_option + '_preprocess';

    let checked = document.getElementById(checkbox_id).checked;
    if (checked) {
        await fetch('/change_preview_images/' + folder_id + '/' + pre_proccessing_option).then(response => {
            return response.text().then(text => {
                console.log('text:', text)
            });
        });
    }
    else {
        await fetch('/change_preview_images/' + folder_id + '/' + 'un_' + pre_proccessing_option).then(response => {
            return response.text().then(text => {
                console.log('text:', text)
            });
        });
    }
}




function close_download_tag() {
    let download_href = document.getElementById('download_tag');
    download_href.innerText = ''
    folder_id = "id" + Math.random().toString(16).slice(2);
    //download_href.href = ''
    document.getElementById('dropzone_buttons').style.display = 'block';
    document.getElementById('augmentation').style.opacity = '25%';
    document.getElementById('Pre-Proccessing').style.opacity = '25%';
}



$( "#slider-range" ).slider({
    range: true
  });

async function upload_folder() {
    document.getElementById('select_folder').style.display = 'none';
    let files = await document.getElementById('design').files
    let batch_size = 10;
    let chunks = chunkDictionary(files, batch_size)
    let num_chunks = chunks.length;
    responses = [];
    let last_upload = 'false';
    for (i = 0; i < chunks.length; i++) {
        console.log('i:', i, 'chunks length:', chunks.length);
        last_upload = String((i + 1) === chunks.length);
        let formData = new FormData();
        let chunk = chunks[i];
        let starting_index = 0;
        if (i > 0) {
            starting_index = parseInt(Object.keys(chunks[i - 1])[Object.keys(chunks[i - 1]).length - 1]) + 1;
        }
        //console.log('starting index:',Object.keys(chunks[i-1])[Object.keys(chunk).length-1])
        let ending_index = Object.keys(chunk)[Object.keys(chunk).length - 1];
        if (!(starting_index === ending_index)) {
            for (g = starting_index; g <= ending_index; g++) {
                formData.append('file', chunk[g]);
            }
        }
        else {
            formData.append('file', chunk[starting_index]);
        }
        // let aug_data = collect_aug_data(); //collect aug data here
        // formData.append('augmentations', aug_data);
        console.log('waiting for chunk ' + String(i + 1) + ' out of ' + num_chunks);
        await fetch('/send_folder/' + folder_id + '/' + last_upload, { body: formData, method: 'post' }).then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(data => {
                    let response_text_from_server = JSON.stringify(data);
                    console.log('response:json ', response_text_from_server);
                    responses.push(response_text_from_server)
                });
            } else {
                return response.text().then(response_text_from_server => {
                    console.log('response: text', response_text_from_server);
                    responses.push(response_text_from_server);
                });
            }
        });
        let progress = (i + 1) / num_chunks * 100;
        document.getElementById('dataset_upload_progress').value = progress;
        // if (response_text_from_server !== 'none') {
        //     console.log(response_text_from_server,'download')
        //     document.getElementById('test_image').src = response_text_from_server;
        // }

    }
    console.log('finished');
    let valid_return_count = 0;
    console.log('responses:', responses)
    for (i = 0; i < responses.length; i++) {
        let response = responses[i];
        if (response.includes('.')) {
            console.log('i:', i)
            valid_return_count += 1;
            document.getElementById('dataset_upload_progress').value = 100
            document.getElementById('dropzone_buttons').style.display = 'none';
            document.getElementById('design').value = null;
            sample_image_extension = response;
            enable_inputs();
            break;
        }
    }
    if (valid_return_count === 0) {
        console.log('no images found')
        alert('no images found in dataset')
        document.getElementById('dropzone_buttons').style.display = 'block';
        document.getElementById('upload_progress').style.display = 'none';
        document.getElementById('zip_upload_buttons').style.display = 'block';

        document.getElementById('select_folder').style.display = 'block';
        set_zip_or_folder_upload();
    }
}

function collect_aug_data() {
    aug_list = [];
    augs_checkboxes = ['Flip_check_box','blur_checkbox', "90° rotate_check_box", 'Crop_checkbox', 'Rotate_checkbox', 'blur_checkbox']
    let flip_checked = document.getElementById('Flip_check_box').checked;//check if blur is checked or not
    let rotation_90_checked = document.getElementById("90° rotate_check_box").checked;
    let crop_checked = document.getElementById('Crop_checkbox').checked;
    let rotate_checked = document.getElementById('Rotate_checkbox').checked;
    let blur_checked = document.getElementById('blur_checkbox').checked;
    let grayscale_checked = document.getElementById('grayscale_checkbox').checked;
    let preProcessGrayScaleChecked = document.getElementById("grayscale_preprocess").checked

    //send pre-process info first

    if(preProcessGrayScaleChecked){
        aug_list.push('grayscalePreProcess');
    }
    if (flip_checked) {
        vertically_flipped = document.getElementById('vertical_flip').checked;
        horizontally_flipped = document.getElementById('horizontal_flip').checked;
        aug_list.push('flip'+"-"+vertically_flipped+"-"+horizontally_flipped) //items in order: vertically flipped, horizontally flipped, vertical prob, horizontal prob
    }
    if (rotation_90_checked) {
        let clockwiseRotated = document.getElementById("Clockwise").checked
        let counterClockwiseRotated = document.getElementById("Counter-Clockwise").checked
        let upsideDownRotated = document.getElementById("Upside Down").checked
        aug_list.push('90_rotate'+"-"+clockwiseRotated+"-"+counterClockwiseRotated+"-"+upsideDownRotated);

    }
    if (crop_checked) {
        console.log("crop checked")
        let min_crop_value = $("#slider-range").slider("values", 0)
        let max_crop_value = $("#slider-range").slider("values", 1)
        aug_list.push("crop"+"-"+min_crop_value+"-"+max_crop_value);
    }
    if (rotate_checked) {
        let degreesRotated = document.getElementById("Rotate_limit").value
        aug_list.push('rotate'+"-"+degreesRotated);
    }
    if (blur_checked) {
        let blurValue = document.getElementById("blur_limit").value
        aug_list.push('blur'+"-"+blurValue);
    }
    if (grayscale_checked) {
        let percentOutputtedImagesToGrayscale = document.getElementById("blur_limit").value
        aug_list.push('grayscale'+"-"+percentOutputtedImagesToGrayscale);
    }
   
    //TODO: return form data instead of list
    return JSON.stringify(aug_list);
}
pop_up_ids = ['rotate_pop_up', 'blur_pop_up', 'Flip_pop_up', '90_rotate_popup', 'crop_pop_up', 'grayscale_popup']
//blur_click_checkbox  flip_click_checkbox verticalflip_click_checkbox horizontalflip_click_checkbox rotate_90_click_checkbox crop_click_checkbox
class display_popups {
    rotate_click_checkbox() {
        let pop_up = document.getElementById('rotate_pop_up');
        let check_box = document.getElementById('Rotate_checkbox');
        if (check_box.checked == true) {
            pop_up.style.display = 'block';
            console.log('checked checkbox');
            document.getElementById("Rotate").style = "display:flex;width:auto;align-items:center;"
        }
        if (check_box.checked == false) {
            pop_up.style.display = 'none';
            console.log('unchecked checkbox');
            document.getElementById("Rotate").style = ""
        }
    }
    blur_click_checkbox() {
        let pop_up = document.getElementById('blur_pop_up')
        let check_box = document.getElementById('blur_checkbox')
        if (check_box.checked == true) {
            pop_up.style.display = 'block';
            console.log('checked checkbox');
                    }
        if (check_box.checked == false) {
            pop_up.style.display = 'none';
            
        }
    }
    flip_click_checkbox() {
        ('Flip pop up method CALLED')
        let flip_pop_up = document.getElementById('Flip_pop_up');
        if (document.getElementById('Flip_check_box').checked == true) {
            flip_pop_up.style.display = 'block';
            ('checked checkbox')
        }
        if (document.getElementById('Flip_check_box').checked == false) {
            flip_pop_up.style.display = 'none';
            ('unchecked checkbox')
        }

    }
    verticalflip_click_checkbox() {
        let vertical_flip_checkbox = document.getElementById('vertical_flip');
        let pop_up = document.getElementById('vertical_flip_popup')
        if (vertical_flip_checkbox.checked == true) {
            pop_up.style.display = 'block';
console.log("checked box");
            // document.getElementById("vertical_flip_sample_img").style.display = "block";
            
        }
        else {
            pop_up.style.display = 'none';
console.log("unchecked box");
        }
    }
    horizontalflip_click_checkbox() {
        let horizontal_flip_checkbox = document.getElementById('horizontal_flip');
        let pop_up = document.getElementById('horizontal_flip_popup')
        if (horizontal_flip_checkbox.checked == true) {
            pop_up.style.display = 'block';
console.log("checked box");
            // document.getElementById("vertical_flip_sample_img")
        }
        else {
            pop_up.style.display = 'none';
console.log("unchecked box");
        }
    }

    rotate_90_click_checkbox() {
        let rotate_90_box = document.getElementById('90° rotate_check_box')
        let rotate_90_pop_up = document.getElementById('90_rotate_popup')
        if (rotate_90_box.checked == true) {
            rotate_90_pop_up.style.display = 'block';
            ('checked checkbox')
        }
        if (rotate_90_box.checked == false) {
            rotate_90_pop_up.style.display = 'none';
            }
    }

    clockwise_click_checkbox() {
        let clockwise_box = document.getElementById('Clockwise')
        let clockwise_pop_up = document.getElementById('clockwise_sample_img')
        if (clockwise_box.checked == true) {
            clockwise_pop_up.style.display = 'block';
            ('checked checkbox')
        }
        if (clockwise_box.checked == false) {
            clockwise_pop_up.style.display = 'none';
        }
    }
    upside_down_click_checkbox() {
        let upside_down_box = document.getElementById('Upside Down')
        let upside_down_pop_up = document.getElementById('upside_down_sample_img')
        if (upside_down_box.checked == true) {
            upside_down_pop_up.style.display = 'block';
            ('checked checkbox')
        }
        if (upside_down_box.checked == false) {
            upside_down_pop_up.style.display = 'none';
        }
    }
    counter_clockwise_click_checkbox() {
        let counter_clockwise_box = document.getElementById('Counter-Clockwise')
        let counter_clockwise_pop_up = document.getElementById('counter_clockwise_sample_img')
        if (counter_clockwise_box.checked == true) {
            counter_clockwise_pop_up.style.display = 'block';
            ('checked checkbox')
        }
        if (counter_clockwise_box.checked == false) {
            counter_clockwise_pop_up.style.display = 'none';
        }
    }

    crop_click_checkbox() {
        let pop_up = document.getElementById('crop_pop_up')
        let check_box = document.getElementById('Crop_checkbox')
        if (check_box.checked == true) {
            pop_up.style.display="block";
            // pop_up.style.cssText = "";
            // console.log('checked checkbox')
        }
        if (check_box.checked == false) {
            // pop_up.style.display = "position: absolute; left: -1000px";
                        // pop_up.style.position='absolute';
            // pop_up.style.left='-1000px';
            pop_up.style.display = 'none';
            
        }
    }
    grayscale_click_checkbox() {
        let pop_up = document.getElementById('grayscale_popup')
        let check_box = document.getElementById('grayscale_checkbox')
        if (check_box.checked == true) {
            console.log(pop_up.style.display)
            pop_up.style.cssText = "";
                    }
        if (check_box.checked == false) {
            // pop_up.style.display = "position: absolute; left: -1000px";
            console.log(pop_up.style.display)
            // pop_up.style.position='absolute';
            // pop_up.style.left='-1000px';
            pop_up.style.display = 'none';
                    }
    }


}
let display_popups_methods = new display_popups();

function reset_inputs() {
    for (i = 0; i < input_ids.length; i++) {
                // input_ids[i].disabled = true;
        document.getElementById(input_ids[i]).checked = false;
    }
    for (i = 0; i < pop_up_ids.length; i++) {
        let popup_id = pop_up_ids[i];
        document.getElementById(popup_id).style.display = 'none';
    }
}

function disable_inputs() {
    reset_inputs();
    for (i = 0; i < input_ids.length; i++) {
        //children[i].disabled = true;
        let input = document.getElementById(input_ids[i]);
                input.disabled = true;
        document.getElementById('augmentation').style.opacity = '25%';
        document.getElementById('Pre-Proccessing').style.opacity = '25%';
        document.getElementById('select_folder').style.display = 'block';
    }
}

function updateImageWidths(){ 
    for(i=0;i<image_ids.length;i++){
        let element = document.getElementById('augmentation')
        var positionInfo = element.getBoundingClientRect();
        var height = positionInfo.height;
        var width = positionInfo.width;
        console.log("width:",width)
        document.getElementById(image_ids[i]).style.width = .3*width+"px"
    }
    console.log("resized");
}
updateImageWidths();
window.addEventListener('resize', updateImageWidths);


async function enable_inputs() {
    reset_inputs();
    document.getElementById('dataset_upload_progress').value = 0
    //upload_progress
    document.getElementById('upload_progress').style.display = 'none';
    document.getElementById('dropzone_buttons').style.display = 'none';
    for (i = 0; i < input_ids.length; i++) {
        //children[i].disabled = true;
        document.getElementById(input_ids[i]).disabled = false;
        document.getElementById('augmentation').style.opacity = '100%';
        document.getElementById('Pre-Proccessing').style.opacity = '100%';
        document.getElementById('dropzone_buttons').style.display = 'none';
    }

    //getting slider ids
    let blur_slider = document.getElementById('blur_limit')
    let rotate_slider = document.getElementById('Rotate_limit')
    //instead of getting the crop slider id, we will get its two values:
    let min_crop_value = $("#slider-range").slider("values", 0)
    let max_crop_value = $("#slider-range").slider("values", 1)

    //setting the default source of all images before user touches sliders
    document.getElementById('blur_normal_sample_image').src = `/static/interactive_images_uploads/${folder_id}/sample${sample_image_extension}`
    document.getElementById('blur_sample_image').src = `/static/interactive_images_uploads/${folder_id}/blur/${String((Number(blur_slider.value)).toFixed(1))}${sample_image_extension}`
    document.getElementById('blur_limit_caption').innerText = String((Number(blur_slider.value)).toFixed(1)) + 'px'
    document.getElementById('show_blur_limit').innerText = String((Number(blur_slider.value)).toFixed(1))
    document.getElementById('grayscale_sample_image').src = `/static/interactive_images_uploads/${folder_id}/sample${sample_image_extension}`
    document.getElementById('rotate_normal_sample_image').src = `/static/interactive_images_uploads/${folder_id}/sample${sample_image_extension}`
    document.getElementById('rotate_sample_image').src = `/static/interactive_images_uploads/${folder_id}/rotate/${String((Number(rotate_slider.value)))}${sample_image_extension}`
    document.getElementById("counter_clockwise_sample_img").src = `/static/interactive_images_uploads/${folder_id}/counter_clockwise/counter_clockwise${sample_image_extension}`
    document.getElementById("clockwise_sample_img").src = `/static/interactive_images_uploads/${folder_id}/clockwise/clockwise${sample_image_extension}`
    document.getElementById("upside_down_sample_img").src = `/static/interactive_images_uploads/${folder_id}/upside_down/upside_down${sample_image_extension}`
    document.getElementById("vertical_flip_sample_img").src = `/static/interactive_images_uploads/${folder_id}/sample${sample_image_extension}` 
    document.getElementById("horizontal_flip_sample_img").src = `/static/interactive_images_uploads/${folder_id}/sample${sample_image_extension}` 
    // document.getElementById("horizontal_flip_sample_img").src = "{{ url_for('/static/interactive_images_uploads', filename=f'{sample}/{sample_image_extension}') }}"

    document.getElementById('rotate_sample_image2').src = `/static/interactive_images_uploads/${folder_id}/rotate/${String((Number(-rotate_slider.value)))}${sample_image_extension}`

    // crop sample img 1 will hold min crop %, crop sample img 2 will hold max crop %
    document.getElementById('crop_sample_img').src = `/static/interactive_images_uploads/${folder_id}/crop/${String((Number(1)))}${sample_image_extension}`
    document.getElementById('crop_sample_img2').src = `/static/interactive_images_uploads/${folder_id}/crop/${String((Number(28)))}${sample_image_extension}`


    

    // making the dictionaries where the images will be stored
    const blur_images = {};
    const rotate_images = {};
    const crop_images = {};

    //fetching all blur images
    await fetch(`/get_all_images/${folder_id}/blur`)
        .then(response => response.json())
        .then(data => {
            for (const [blur_value, image_data] of Object.entries(data)) {
                if (image_data) {
                    blur_images[blur_value] = `data:image/jpeg;base64,${image_data}`;
                }
            }
        })
        .catch(error => console.error('Error fetching images:', error));

    //fetching all rotate images
    await fetch(`/get_all_images/${folder_id}/rotate`)
        .then(response => response.json())
        .then(data => {
            for (const [rotate_value, image_data] of Object.entries(data)) {
                if (image_data) {
                    console.log("image data exists");
                    rotate_images[rotate_value] = `data:image/jpeg;base64,${image_data}`;
                }
            }
        })
        .catch(error => console.error('Error fetching images:', error));

    //fetching all crop images
    await fetch(`/get_all_images/${folder_id}/crop`)
        .then(response => response.json())
        .then(data => {
            for (const [crop_value, image_data] of Object.entries(data)) {
                if (image_data) {
                    crop_images[crop_value] = `data:image/jpeg;base64,${image_data}`;
                }
            }
        })
        .catch(error => console.error('Error fetching images:', error));

    //making it so that the blur slider shows preview images
    blur_slider.addEventListener('input', function () {
        const blur_value = this.value;
        const imgElement = document.getElementById('blur_sample_image');

        if (blur_images[blur_value]) {
            imgElement.src = blur_images[blur_value];
        }
    });
    //making it so that the rotate slider shows preview images
    rotate_slider.addEventListener('input', function () {
        const rotate_value = this.value;
        const imgElement1 = document.getElementById('rotate_sample_image');
        const imgElement2 = document.getElementById('rotate_sample_image2');
        if (rotate_images[rotate_value]) {
            imgElement1.src = rotate_images[rotate_value];
            imgElement2.src = rotate_images[-rotate_value];
        }
    });
    //making it so that the crop slider shows preview images
    $( function() {
        $( "#slider-range" ).slider({
          range: true,
          min: 1,
          max: 99,
          values: [1, 28],
          slide: function( event, ui ) {
            $( "#amount" ).val(ui.values[ 0 ] +"%" +" - " + ui.values[ 1 ]+"%" );
            console.log("Selected range:", ui.values[0], ui.values[1]);
            const imgElement1 = document.getElementById('crop_sample_img');
            const imgElement2 = document.getElementById('crop_sample_img2');
            if(crop_images[ui.values[0]]){
                imgElement1.src = crop_images[ui.values[0]]
            }
            if(crop_images[ui.values[1]]){
                imgElement2.src = crop_images[ui.values[1]]
            }

          }
        });
        $( "#amount" ).val(  $( "#slider-range" ).slider( "values", 0 ) +"%"+
          " - " + $( "#slider-range" ).slider( "values", 1 ) +"%");
      } );

    let originalImageWidth = document.getElementById('blur_sample_image').width;
    let originalImageHeight = document.getElementById('blur_sample_image').height;
    let imageWidthToHeightRatio = originalImageWidth/originalImageHeight
    let imageHeightToWidthRatio = originalImageHeight/originalImageWidth
    // console.log("original width to height ratio:",imageWidthToHeightRatio)
    // console.log("original height to width ratio:",imageHeightToWidthRatio)
    // console.log('width:', originalImageWidth);
    // console.log('height:', originalImageHeight);
    // for (i = 0; i < image_ids.length; i++) {
    //     let imageElement = document.getElementById(image_ids[i])
    //     // imageElement.style.width = 15*imageWidthToHeightRatio+"vw";
    //     // imageElement.style.height = (15*imageWidthToHeightRatio)*imageHeightToWidthRatio+"vw";
    //     // imageElement.style.maxWidth="50%"
    //     // imageElement.style.maxHeight= imageHeightToWidthRatio*imageElement.style.width
    
    // }

}


class range_input_scripts {

    update_probabilities() {
        let sliders = ['Rotate_limit', 'blur_limit', 'grayscale_probability'];
        let i = 0
        while (i < sliders.length) {
            
            let slider = document.getElementById(sliders[i]);
            let show_slider = document.getElementById(`show_${sliders[i]}`)
            show_slider.innerText = slider.value
            if (sliders[i] === 'blur_limit') {
                // TODO: CHANGE SOURCE OF BLUR IMAGE HERE
                document.getElementById('blur_limit_caption').innerText = String(slider.value) + 'px'
            }
if (sliders[i] === 'Rotate_limit') {
                document.getElementById('rotate_limit_caption').innerText = String(document.getElementById(sliders[i]).value) + '°'
                document.getElementById('rotate_limit_caption2').innerText = String(-1 * document.getElementById(sliders[i]).value) + '°'
            }

            i++
        }
    }
}
let data1;
async function submit_everything() {
    alert("Augmenting uploaded dataset now...");
    let aug_form_data = collect_aug_data();
    disable_inputs(); 
    let formData = new FormData();
    formData.append('aug_data', aug_form_data)
    //TODO: method here to call augmentation for specific dataset id and send over augmentation data
    //ex. augment_dataset(dataset_id,augmentation_form_data);
    //once dataset is finished augmenting
    await fetch('/augment/' + folder_id, { body: formData, method: 'post' }).then(response => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(data => {
                data1 = JSON.stringify(data);
            });
        } else {
            return response.text().then(text => {
                console.log('text:', text)
            });
        }
    });
    document.getElementById('download_tag').innerText = 'click here to download augmented dataset';
    document.getElementById('download_tag').href = '/download/' + folder_id;
}


class copy_paste_code_scripts {
    copy_and_paste() {
        let copy_text = document.getElementById('code_block'); // id of the textbox
        copy_text.select();
        navigator.clipboard.writeText(copy_text.value);
        //document.execCommand("copy");
        alert('copy and pasted augmentation code');
    }



    // show_copy_and_paste_checkbox() {
    //     /*let aug_string = "import albumentations as A\n" + "import cv2\n" +
    //          "transform = A.Compose([\n" + "A.RandomCrop(width=256, height=256),\n" +
    //          "A.HorizontalFlip(p=0.5),\n" +
    //          "A.RandomBrightnessContrast(p=0.2)])\n";*/
    //     let check_box_element = document.getElementById('copy_paste_div');
    //     check_box_element.style.display = 'block';
    //     let text_box = document.getElementById('code_block');
    //     text_box.value = 'test';
    //     folder_id = "id" + Math.random().toString(16).slice(2);
    //     // Access Dropzone instance
    //     close_download_tag();
    //     var dropzone = Dropzone.forElement('#dropper');
    //     // dropzone.processQueue();
    //     //dropzone.removeAllFiles(true);
    //     // sending over
    // }
}

let copy_paste_code_methods = new copy_paste_code_scripts();
let range_input_methods = new range_input_scripts();
function check_if_image(data) {
    let valid_extensions = ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    for (i = 0; i < valid_extensions.length; i++) {
        if (data.includes(valid_extensions[i])) {
            return true;
        }
    }
    return false;
}


Dropzone.options.dropper = {
    paramName: 'file',
    autoProcessQueue: true,
    chunking: true,
    forceChunking: true,
    url: '/upload',
    autoDiscover: true,
    timeout: 1.8e+6,//30 minute timeout
    init: function () {
        // this.hiddenFileInput.setAttribute("webkitdirectory", true);
        this.on("queuecomplete", async function () {
            this.removeAllFiles(true);
            console.log('file id:', folder_id);
            let data1 = 'test';
            //wait for upload to finish, then enable inputs (augmentation options)
            while (data1 !== 'none' && !(data1.includes('.'))) {
                console.log('checking if finished...')
                await fetch('/check_finished/' + folder_id).then(response => {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") == -1) {
                        return response.text().then(text => {
                            console.log('response:', text)
                            data1 = text;
                        });
                    }
                });
            }
            if (data1 === 'none') {
                console.log('no images found. invalid dataset')
                alert('dataset invalid or no images found')
                folder_id = "id" + Math.random().toString(16).slice(2);

            }
            else {
                console.log('dataset uploaded successfully, valid')
                sample_image_extension = data1;
                enable_inputs();
                document.getElementById('dropzone_buttons').style.display = 'none';
                //document.getElementById('test_image').src = data1
            }

        });
        this.on("sending", function (file, xhr, formData) {
            // Add parameters to be sent with every chunk request
            formData.append('id', folder_id);
            console.log('sent chunk')
        });
    },

    maxFilesize: 100 * 1e+3, // MB (100 gb) 
    chunkSize: (1e+7), // bytes
    acceptedFiles: '.zip',
    maxFiles: 1,
    parallelUploads: 1,
    maxfilesexceeded: function (file) {
        this.removeAllFiles();
        this.addFile(file);
    }
}
function set_zip_or_folder_upload() {
    folder_id = "id" + Math.random().toString(16).slice(2);
    var dropzoneElement = document.getElementById('dropper');
    Dropzone.forElement('#dropper').removeAllFiles(true);
    let zip_option = document.getElementById('zip');
    let folder_option = document.getElementById("folder");
    if (zip_option.checked) {
        document.getElementById('design').value = null;
        console.log('doing zip uploads');
        default_upload_option = 'zip'
        document.getElementById('folder_upload_buttons').style.display = 'none';
        document.getElementById('zip_upload_buttons').style.display = 'block';
    }
    if (folder_option.checked) {
        document.getElementById('design').value = null;
        console.log('doing folder uploads');
        default_upload_option = 'folder'
        document.getElementById('folder_upload_buttons').style.display = 'block';
        document.getElementById('zip_upload_buttons').style.display = 'none';
    }
}


function send_dataset() {
console.log('sending')
    //TODO: only do this if there is a zip file in dropzone
    if (default_upload_option === 'zip') {
        var dropzone = Dropzone.forElement('#dropper');
        if (dropzone.getQueuedFiles().length > 0) {
            document.getElementById('augmentation').style.opacity = '25%';
            document.getElementById('Pre-Proccessing').style.opacity = '25%';
            dropzone.processQueue();
        }
    }

    else {
        if (document.getElementById('design').files.length > 0) {
console.log('sening folderx')
            document.getElementById('upload_progress').style.display = 'block';
            document.getElementById('dropzone_buttons').style.display = 'none';
            upload_folder();
        }
    }
    }