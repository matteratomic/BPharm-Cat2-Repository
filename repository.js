var uploadButton = document.querySelector('#upload')
var loader = document.querySelector('.m-loader-background-two')
var fileInputElement = document.querySelector('input[type="file"]')
var form = document.querySelector('form')
var loadingText = document.querySelector('#loading-text')
var selectElement = document.querySelector('select')
var fileList = []
var selectedPath = ''


window.onload = ()=>{
getResource()
  .then((res)=>{
    selectedPath = '/resources'
    window.history.pushState({path:'/resources',name:'year1'},'upload','/upload.html')
    res.data.forEach((option,i)=>{
      let opt = document.createElement('option')
      opt.value = JSON.stringify({filepath:option.filepath,type:option.type,name:option.name})
      opt.innerHTML = option.name 
      selectElement.appendChild(opt)
    })
  })
}

window.onpopstate = (e)=>{
  let path = e.state.path || 'resources'
  let name = e.state.name || 'year2'
   selectedPath = path
   console.log(`Selected path is ${path}`)
   loader.classList.add('m-loader-visible')
  getResource(path)
  .then((res)=>{
    console.log(res.data.length)
    if(res.data.length !==0){
      selectElement.innerHTML =''
    }else{
      console.log('end',selectedPath)
    } 
      return res
  }).then((res)=>{
    loader.classList.remove('m-loader-visible')
      res.data.forEach((option,i)=>{
        let opt = document.createElement('option')
        opt.value = JSON.stringify({filepath:option.filepath,type:option.type,name:option.name})
        opt.innerHTML = option.name
        selectElement.appendChild(opt)
    })
  })
}

function selectValueChanged(){
var file = JSON.parse(selectElement.value)
console.log(JSON.parse(selectElement.value))
loader.classList.add('m-loader-visible')
if(file.type == 'directory'){
  selectedPath = file.filepath
     console.log(`Selected path is ${selectedPath}`)
window.history.pushState({path:file.filepath,name:file.name},file.name,'/upload.html')
getResource(file.filepath)
  .then((res)=>{
  if(res.data.length !== 0){
      selectElement.innerHTML =''
    }else{ 
      console.log('end',selectedPath)
    }       return res
  }).then((res)=>{
    loader.classList.remove('m-loader-visible')
      res.data.forEach((option,i)=>{
        let opt = document.createElement('option')
        opt.value = JSON.stringify({filepath:option.filepath,type:option.type,name:option.name})
        opt.innerHTML = option.name || 'No files added' 
        selectElement.appendChild(opt)
    })
  })
}else{
  loader.classList.remove('m-loader-visible')
  alert('You have to choose a folder path !')
}
}

var getResource = (path='/resources')=>{
  return new Promise((resolve,reject)=>{
fetch(`/api/resources/?path=${path}`).then(res=>res.json())
.then((res)=>{resolve(res)}).catch((err)=>{reject(err)})
  })
}

form.onsubmit = (e)=>{
e.preventDefault()}

fileInputElement.onchange = ()=>{
  if(fileInputElement.files.length){
    fileInputElement.classList.add('m-has-file')
  }else{
        fileInputElement.classList.remove('m-has-file')
  }
fileList = []
for(var i = 0;i<fileInputElement.files.length;i++){
fileList.push(fileInputElement.files[i])
}
console.log(fileList)
}

var prepareResource = (resource,path)=>{
return new Promise((resolve)=>{
let formData = new FormData()
formData.append('resource',resource)
formData.append('path',path)
if(formData){
resolve(formData)
}else{
reject('Error parsing form data')
}
})
}

var sendResources = (resource,path)=>{
loader.classList.add('m-loader-visible')
loadingText.innerHTML = 'Uploading resource. Please wait...'
prepareResource(resource,path)
  .then((formData)=>{
    console.log('uploading '+resource.name)
    fetch(`/api/upload`,{
method:'POST',
body:formData
}).then(res=>res.json())
      .then((res)=>{
        loadingText.innerHTML = 'Loading...'
        loader.classList.remove('m-loader-visible')
        alert('Upload successful')
      }).catch((err)=>{
        loader.classList.remove('m-loader-visible')
        loadingText.innerHTML = 'Loading...'
        alert('The upload was unsuccessful. Hint:Only files accepted NOT folders')
      })
  }).catch((err)=>{
        loader.classList.remove('m-loader-visible')
        loadingText.innerHTML = 'Loading...'
        alert('The upload was unsuccessful. Hint:Only files accepted NOT folders')
        console.log(err)

  })
}

uploadButton.onclick = ()=>{
if(fileList.length && selectedPath && selectedPath.trim()){
fileList.forEach((resource,i)=>{
sendResources(resource,selectedPath)
})
}else{
alert('Choose a resource and upload path!')
}
}