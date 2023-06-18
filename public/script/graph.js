// import  Chart  from "chart.js/auto";
// var xyValues = [
//   {x:50, y:7},
//   {x:60, y:8},
//   {x:70, y:8},
//   {x:80, y:9},
//   {x:90, y:9},
//   {x:100, y:9},
//   {x:110, y:10},
//   {x:120, y:11},
//   {x:130, y:14},
//   {x:140, y:14},
//   {x:150, y:15}
// ];
// const ctx = document.getElementById('mychart');
// new Chart(ctx, {
//   type: "scatter",
//   data: {
//     datasets: [{
//       pointRadius: 4,
//       pointBackgroundColor: "rgb(0,0,255)",
//       data: xyValues
//     }]
//   },
//   options: {
//     legend: {display: false},
//     scales: {
//       xAxes: [{ticks: {min: 40, max:160}}],
//       yAxes: [{ticks: {min: 6, max:16}}],
//     }
//   }
// });

import { response } from "express";

// function onSubmit(event){
//   event.preventDefault();

//   let inp = event.currentTarget.elements;
//   console.log(inp);
// }

const form = document.getElementById('statform');
if(form != null){
    form.addEventListener('submit', onSubmit)
}else{
  var xyValues = [
  ];
  
  new Chart("myChart", {
    type: "scatter",
    data: {
      datasets: [{
        pointRadius: 4,
        pointBackgroundColor: "rgb(0,0,255)",
        data: xyValues
      }]
    },
    options: {
      legend: {display: false},
      scales: {
        xAxes: [{ticks: {min: 40, max:160}}],
        yAxes: [{ticks: {min: 0, max:5}}],
      }
    }
  });
}

// let barchart;

// function onSubmit(event){   
//     event.preventDefault();
//     let inp = event.currentTarget.elements;
//     // console.log(inp[0].value)
//     const obj = { category: inp[0].value, subcategory: inp[1].value }
//     let str = encodeURL(obj);
//     // console.log(str);
//     const init = {
//       method: 'post',
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       },
//       body: str
//     };

//     fetch('/stat', init)
//     .then(response => { return response.text(); })
//     .then(result => {
//       console.log(result);
//       let resultJSON = JSON.parse(result);
//       const ctx = document.getElementById('myChart');

//       if(barchart != null){
//         barchart.destroy();
//       }
//       barchart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: resultJSON.brands,
//             datasets: [{
//                 label: 'brands',
//                 data: resultJSON.avgValue,
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                 beginAtZero: true
//                 }
//             }
//         }
//       });
//     })
// }

let barchart; // Declare the variable outside the function

function onSubmit(event) {
  event.preventDefault();
  let inp = event.currentTarget.elements;
  const obj = { category: inp[0].value, subcategory: inp[1].value };
  let str = encodeURL(obj);

  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: str
  };

  fetch('/stat', init)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      let resultJSON = JSON.parse(result);
      if(resultJSON.status == 'success'){
        const ctx = document.getElementById('myChart');

      if (barchart != null) {
        barchart.destroy();
      }

      console.log(resultJSON.Brands);

        barchart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: resultJSON.Brands, // Use arrBrands property
            datasets: [{
              label: 'Average Rating',
              data: resultJSON.AvgValue, // Use arrAvgValue property
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    });
}


function encodeURL(data){
  const ret = [];
  for (let d in data){
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
}