
function readRate(str){
  if(!str)
    throw new Error(`Empty rate`);
  let v = +str.slice(0,-1);
  let u = str.slice(-1);
  if(u == "%")
    return v/100;
  throw new Error(`Unrecognized rate unit: ${u}`);
}

function readListNum(str){
  if(!str)
    throw new Error(`Empty list of number`);
  return str.split(",").map(s => s.trim()).map(s => +s);
}

function readCorrelationMatrix(str){
  if(!str)
    throw new Error(`Empty correlation matrix`);
  return str.split("\n").map(readListNum);
}

function writeListNum(list, digit){
  return list.map(v => v.toFixed(digit)).join(",");
}

function writeCorrelationMatrix(corr, digit){
  return corr.map(row => writeListNum(row, digit)).join("\n");
}

function compute(){
  let wgt1 = readRate(document.getElementById("wgt1").value);
  let wgt2 = readRate(document.getElementById("wgt2").value);
  let vol1 = readRate(document.getElementById("vol1").value);
  let vol2 = readRate(document.getElementById("vol2").value);
  let corr = readRate(document.getElementById("corr").value);
  let vol = Math.sqrt(wgt1*wgt1*vol1*vol1 + wgt2*wgt2*vol2*vol2 + 2*corr*wgt1*wgt2*vol1*vol2);
  document.getElementById("vol").value = (100*vol).toFixed(2) + "%"
}
/*
function computeImpliedCorr(){
  let vol1 = readRate(document.getElementById("volCcy1").value);
  let vol2 = readRate(document.getElementById("volCcy2").value);
  let vol3 = readRate(document.getElementById("volCcy3").value);
  let corr = (vol3*vol3 - (vol1*vol1 + vol2*vol2))/(2*vol1*vol2);
  document.getElementById("corrCcy").value = (100*corr).toFixed(2) + "%"
}
*/
function fixMatrix(matrix, eps){
  const diag = numeric.T.diag;
  let eig = numeric.eig(matrix);
  let eigValue = eig.lambda.x.map(v => v>0?v:eps);
  let eigVector = eig.E;
  let sqrtT = diag(eigVector.x.map((ev,i) => Math.sqrt(1/ev.reduce((s,e,m) => s+e*e*eigValue[m], 0))));
  let sqrtL = diag(eigValue.map(v => Math.sqrt(v)));
  let B = sqrtT.dot(eigVector.dot(sqrtL));
  return B.dot(B.transjugate()).x;
}

function correctIt(){
  let matrix = readCorrelationMatrix(document.getElementById("corrMatrix").value);
  document.getElementById("eigenBefore").value = writeListNum(numeric.eig(matrix).lambda.x, 5);
  let eps = +document.getElementById("minEigen").value;
  let corrected = fixMatrix(matrix, eps);
  document.getElementById("corrMatrixOut").value = writeCorrelationMatrix(corrected, 5);
  document.getElementById("eigenAfter").value = writeListNum(numeric.eig(corrected).lambda.x, 5);
}