"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[237],{4181:function(e,t,r){r.r(t),r.d(t,{default:function(){return d}});var a=r(3117),n=r(7294);function l(e){var t,r,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(r=l(e[t]))&&(a&&(a+=" "),a+=r);else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}function s(){for(var e,t,r=0,a="";r<arguments.length;)(e=arguments[r++])&&(t=l(e))&&(a&&(a+=" "),a+=t);return a}var i=r(7676),c=r(9960),o=r(2263),m=r(4996),u={heroBanner:"heroBanner_UJJx",buttons:"buttons_pzbO",features:"features_keug",featureImage:"featureImage_yA8i",getStarted:"getStarted_Sjon"};const g=[{title:"TODO",imageUrl:"img/undraw_appreciation.svg",description:n.createElement(n.Fragment,null,"TODO")},{title:"TODO",imageUrl:"img/undraw_powerful.svg",description:n.createElement(n.Fragment,null,"TODO")},{title:"Thoroughly tested",imageUrl:"img/undraw_online_test.svg",description:n.createElement(n.Fragment,null,"An extensive suite of automated tests verifies every change to the codebase.")}];function f(e){let{imageUrl:t,title:r,description:a}=e;const l=(0,m.Z)(t);return n.createElement("div",{className:s("col col--4",u.feature)},l&&n.createElement("div",{className:"text--center"},n.createElement("img",{className:u.featureImage,src:l,alt:r})),n.createElement("h3",null,r),n.createElement("p",null,a))}var d=()=>{const e=(0,o.Z)(),{siteConfig:t}=e;return n.createElement(i.Z,{title:"Test orchestration",description:"Orchestrate package testing across uneven terrain"},n.createElement("header",{className:s("hero hero--primary",u.heroBanner)},n.createElement("div",{className:"container"},n.createElement("h1",{className:"hero__title"},t.title),n.createElement("p",{className:"hero__subtitle"},t.tagline),n.createElement("div",{className:u.buttons},n.createElement(c.Z,{className:s("button button--lg",u.getStarted),to:(0,m.Z)("docs/")},"Get started")))),n.createElement("main",null,g&&g.length>0&&n.createElement("section",{className:u.features},n.createElement("div",{className:"container"},n.createElement("div",{className:"row"},g.map(((e,t)=>n.createElement(f,(0,a.Z)({key:t},e)))))))))}}}]);