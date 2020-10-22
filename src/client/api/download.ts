export async function downloadFile(name:string, extension:string = 'pdf', data:any) {
  console.log('data received: ', data);
  
  const fileName = `${name}.${extension}`
  const element = document.createElement('a');
  const decodedData = window.atob(window.btoa(data));
  let byteNumbers = new Array(decodedData.length);

  for (var i = 0; i < decodedData.length; i++) {
    byteNumbers[i] = decodedData.charCodeAt(i);
  }

  console.log('decodedData: ', decodedData);
  console.log('byte numbers: ', byteNumbers)
  // const buffer = new ArrayBuffer(decodedData.length);
  const byteArray = new Uint8Array(byteNumbers);
  // const bytes = new Int8Array(decodedData.length);

  console.log('byteArray: ', byteArray);
  // const fileData = bytes.map((byte, i) => decodedData.charCodeAt(i));

  const blobFile = new Blob(["cool"], {type: "text/plain"});
  const url = window.URL.createObjectURL(blobFile);
  
  // console.log('fileData: ', fileData);
  console.group('blobFile: ', blobFile)
  
  element.setAttribute('href', url);
  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}
