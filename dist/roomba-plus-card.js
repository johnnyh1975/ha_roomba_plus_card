var W=class{constructor(s,t){this.hass=s;this.config=t;this.entryId=null}updateHass(s){this.hass=s}async fetch(s){let n=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?days=${s}`,r=await this.hass.fetchWithAuth(n);if(!r.ok)throw new Error(`${r.status}`);return r.json()}async resolveEntryId(){if(this.entryId)return this.entryId;let s=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.config.entity});return this.entryId=s.config_entry_id,this.entryId}};function m(e){return String(e??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]??s)}function P(e,s){return e.states[s]?.state??"unavailable"}function re(e,s,t){return s==="m2"||s==="auto"&&t?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function xe(e){let s=Date.now()-new Date(e).getTime(),t=Math.floor(s/6e4);if(t<1)return"just now";if(t<60)return`${t}m ago`;let n=Math.floor(t/60);return n<24?`${n}h ago`:`${Math.floor(n/24)}d ago`}function $e(e){let s=["th","st","nd","rd"],t=e%100;return e+(s[(t-20)%10]??s[t]??s[0])}function se(e){let{hass:s,config:t,caps:n,robotName:r,loadingAction:a,todayMissionCount:o}=e,c=t.entity,i=P(s,c),l=s.states[c]?.attributes??{},p=s.config?.unit_system?.length==="m",d=t.area_unit??"auto",u=i==="unavailable",h=a!==null,g=r,w=`sensor.${g}_last_error_code`,_=`sensor.${g}_last_error_zone`,T=`sensor.${g}_mission_recharge_time`,f=`sensor.${g}_mission_expire_time`,v=`sensor.${g}_missions_last_30d`,S=`sensor.${g}_average_area_30d`,k=`sensor.${g}_area_cleaned_today`,x=l.mission_elapsed_min??null,C=l.mission_area_sqft??null,$=parseFloat(P(s,v)),b=isNaN($)||$<=0?45:$,D=parseFloat(P(s,S)),E=n.isMop,L=E?"\u{1F9F9}":"\u{1F916}",N=m(l.friendly_name??c),Z=P(s,T),B=P(s,f),Y=Z!=="unavailable"&&Z!=="unknown"&&B!=="unavailable"&&B!=="unknown",O=Y?new Date(B):null,J=i==="docked"&&Y&&!!O&&O>new Date,M="",R="",q="";if(J&&O){let y=Math.max(1,Math.round((O.getTime()-Date.now())/6e4));M="\u26A1",R=`Resuming in ~${y} min`}else switch(i){case"cleaning":M="\u25CF",R=E?"Mopping":"Cleaning";break;case"paused":M="\u23F8",R="Paused";break;case"returning":M="\u21A9",R="Returning to dock";break;case"docked":M="\u2713",R="Docked";break;case"idle":M="\u25CB",R="Idle";break;case"error":M="\u26A0",R="Error",q="rpc-error-state";break;case"unavailable":M="\u2014",R="Unavailable";break}let K="";if(i==="error"){let y=s.states[w];if(y&&y.state!=="0"&&y.state!==""&&y.state!=="unavailable"){let A=m(y.attributes.description??"Unknown error"),z=m(y.attributes.action??""),H=P(s,_),V=H&&H!=="unknown"&&H!=="unavailable";R=`Error ${m(y.state)} \u2014 ${A}`,K=`
        ${z?`<div class="rpc-error-action">${z}</div>`:""}
        ${V?`<div class="rpc-error-zone">Zone: ${m(H)}</div>`:""}
      `}else R="Robot error \u2014 check the iRobot app"}let Q="";if(i==="cleaning"&&n.hasArea){let y=parseFloat(P(s,k));if(!isNaN(y)&&y>0){let A=re(y,d,p),z=o!==null?o+1:null,H=z!==null&&z>1?` \xB7 ${m($e(z))} mission`:"";Q=`<div class="rpc-area-today">${A} already today${H}</div>`}}let X="";i==="cleaning"&&x!==null&&(X=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(x/b*100,95)}%"></div></div>`);let ee="";if(i==="cleaning"){let y=[];if(x!==null){let A=Math.max(0,Math.round(b-x));y.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${A} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(n.hasArea&&C!==null&&(y.push(`<div class="rpc-metric"><span class="rpc-metric-val">${re(C,d,p)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`),!isNaN(D)&&D>0)){let A=parseFloat(P(s,`sensor.${g}_mission_count_30d`));if(!isNaN(A)&&A>=5){let z=Math.round((C-D)/D*100),H=z>=0?"\u25B2":"\u25BC",V=z>=0?"rpc-delta-up":"rpc-delta-down";y.push(`<div class="rpc-metric"><span class="rpc-metric-val ${V}">${H} ${Math.abs(z)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}y.length&&(ee=`<div class="rpc-metrics-row">${y.join("")}</div>`)}let te="";if(i==="docked"&&!J){let y=s.states[c]?.last_changed;y&&(te=`<div class="rpc-docked-since">Last mission: ${xe(y)}</div>`)}let ve='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',I=(y,A,z)=>{let H=a===y;return`<button class="rpc-btn${H?" rpc-btn-loading":""}"
      data-action="${y}"
      ${u||h?"disabled":""}
      aria-label="${A}">
      ${H?ve:z}
    </button>`},F="";return i==="cleaning"?F=I("pause","Pause","\u23F8 Pause")+I("return_home","Return home","\u21A9 Return home"):i==="paused"?F=I("resume","Resume","\u25B6 Resume")+I("return_home","Return home","\u21A9 Return home"):i!=="returning"&&!u&&(F=I("start","Start","\u25B6 Start")+I("locate","Locate","\u2299 Locate")),`
    <div class="rpc-zone rpc-zone1${q?" "+q:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${L}</span>
        <span class="rpc-robot-name">${N}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${i}">${M}</span>
        <span class="rpc-state-label">${R}</span>
      </div>
      ${Q}
      ${K}
      ${X}
      ${ee}
      ${te}
      ${F?`<div class="rpc-actions">${F}</div>`:""}
    </div>
  `}var j={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},U={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function ae(e){let{hass:s,config:t,caps:n,robotName:r,selectedRooms:a,passes:o,isSending:c,sendError:i}=e;if(!n.hasZones||t.show_rooms===!1)return"";let l=r,p=s.states[`select.${l}_smart_zone_select`],d=s.states[`select.${l}_zone_select`],u=p??d;if(!u)return"";let h=u.attributes.options??[];if(h.length===0)return"";let g=s.states[`button.${l}_repeat_mission`],w=!!g&&g.state!=="unavailable",_=s.states[`select.${l}_cleaning_passes`],f=n.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",v=a.size,S='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',k=h.map(C=>{let $=a.has(C);return`<button class="rpc-room-chip${$?" rpc-room-chip--selected":""}"
      data-room="${m(C)}" aria-pressed="${$}">${m(C)}</button>`}).join(""),x="";if(_){let C=U[_.state]??"Auto",$=o;x=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(b=>`<button class="rpc-pass-chip${$===b?" rpc-pass-chip--selected":""}"
            data-pass="${b}"
            data-pass-option="${m(j[b]??b)}">${b}</button>`).join("")}
      </div>
    `}return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${k}
        ${v>0?`<span class="rpc-selected-count">${v} selected</span>`:""}
      </div>
      ${x}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${v===0||c?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${v===0||c?"disabled":""}
                aria-label="${f}">
          ${c?S+" Sending\u2026":f}
        </button>
        ${w?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${i?`<div class="rpc-send-error">${m(i)}</div>`:""}
    </div>
  `}function oe(e,s){return Math.min(100,Math.max(0,Math.round(e/s*100)))}function ne(e,s){return s==="battery"?e>20?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)":s==="tank"?e>40?"var(--rpc-green)":e>20?"var(--rpc-amber)":"var(--rpc-red)":e>50?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)"}function _e(e,s){let t=s/90;if(!t)return"";let n=e/t;return n>1.2?"\u2191":n<.8?"\u2193":"\u2192"}function we(e){let s=Math.floor((Date.now()-new Date(e).getTime())/864e5);return s===0?"today":s===1?"yesterday":`${s} days ago`}function ie(e){let s=parseInt(e,10);return!isNaN(s)&&s>=0?`~${s} use${s!==1?"s":""} remaining`:e==="Empty"?"Bag full \u2014 replace soon":e==="Full"?"Bag has capacity":m(e)}function le(e,s,t,n,r){if(s.show_health===!1)return"";let a=n,o=[];e.states[`sensor.${a}_filter_remaining_hours`]&&o.push({key:"filter",label:"Filter",sensorId:`sensor.${a}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${a}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${a}_filter_last_replaced`}),t.hasBrush&&e.states[`sensor.${a}_brush_remaining_hours`]&&o.push({key:"brush",label:"Brush",sensorId:`sensor.${a}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${a}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${a}_brush_last_replaced`}),t.hasPad&&e.states[`sensor.${a}_mop_pad_remaining_hours`]&&o.push({key:"pad",label:"Pad",sensorId:`sensor.${a}_mop_pad_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${a}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${a}_pad_last_replaced`}),t.hasWater&&e.states[`sensor.${a}_mop_tank_level`]&&o.push({key:"tank",label:"Tank",sensorId:`sensor.${a}_mop_tank_level`,thresholdAttr:null,type:"tank"});let c=e.states[`sensor.${a}_battery_level`]?`sensor.${a}_battery_level`:e.states[`sensor.${a}_battery`]?`sensor.${a}_battery`:null,i=c?void 0:e.states[`vacuum.${a}`]?.attributes?.battery_level;if((c||i!==void 0)&&o.push({key:"battery",label:"Battery",sensorId:c??"",thresholdAttr:null,type:"battery",rawPct:i}),t.hasCleanBase&&e.states[`sensor.${a}_clean_base_status`]&&o.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${a}_clean_base_status`,thresholdAttr:null,type:"cleanbase"}),o.length===0)return"";let l=o.map(d=>Se(d,e,a,r)).join(""),p="";if(t.isMop){let d=e.states[`sensor.${a}_mop_pad`],u=e.states[`sensor.${a}_mop_behavior`],h=[];d&&d.state!=="unknown"&&d.state!=="unavailable"&&h.push(m(d.state)),u&&u.state!=="unknown"&&u.state!=="unavailable"&&h.push(`${m(u.state)} intensity`),h.length&&(p=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${h.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${l}
      ${p}
    </div>
  `}function Se(e,s,t,n){let r=n.openPopover===e.key;if(e.type==="cleanbase"){let u=s.states[e.sensorId];return u?`
      <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${r}" tabindex="0"
           aria-label="${e.label}">
        <span class="rpc-bar-label">${e.label}</span>
        <span class="rpc-bar-cleanbase-state">${ie(u.state)}</span>
      </div>
      ${r?Te(e.label,u.state):""}
    `:""}let a=0,o="",c="",i=null;if(e.rawPct!==void 0)a=Math.min(100,Math.max(0,e.rawPct)),o=`${Math.round(a)}%`;else{let u=s.states[e.sensorId];if(!u)return"";let h=parseFloat(u.state);if(isNaN(h))return"";if(e.type==="tank"||e.type==="battery")a=Math.min(100,Math.max(0,h)),o=`${Math.round(a)}%`;else{if(i=e.thresholdAttr?u.attributes[e.thresholdAttr]:null,!i)return"";a=oe(h,i),o=`${a}%`,c=`${Math.round(h)}h`}}let l=ne(a,e.type),p="";if(e.wearSensorId&&i){let u=s.states[e.wearSensorId];u&&u.state!=="unknown"&&u.state!=="unavailable"&&(p=_e(parseFloat(u.state),i))}let d=e.rawPct!==void 0?{state:String(Math.round(e.rawPct)),attributes:{}}:s.states[e.sensorId];return`
    <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${r}" tabindex="0"
         aria-label="${e.label} \u2014 ${o}">
      <span class="rpc-bar-label">${e.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${a}%;background:${l}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${l}">${o}</span>
      ${c?`<span class="rpc-bar-hours">${c}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${l}">${p}</span>`:""}
    </div>
    ${r&&d?ke(e,d,i,s,n):""}
  `}function ke(e,s,t,n,r){let a=parseFloat(s.state),o=t?oe(a,t):Math.min(100,Math.max(0,a)),c=ne(o,e.type),i=r.resetting===e.key,l=e.lastReplacedId?n.states[e.lastReplacedId]:null,p="";return l&&l.state!=="unavailable"&&l.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(l.state).toLocaleDateString()} (${we(l.state)})</span>
      </div>`),`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${m(e.label)}</span>
        <button class="rpc-popover-close" data-close="${e.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${t?`<div class="rpc-popover-row"><span>Threshold</span><span>${t} h</span></div>`:""}
      ${t?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(a)} h (${o}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${o}%;background:${c}"></div>
      </div>
      ${e.resetService?`
        <button class="rpc-btn rpc-btn-secondary${i?" rpc-btn-loading":""}"
                data-reset="${e.key}" data-service="${e.resetService}"
                ${i?"disabled":""}>
          ${i?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${r.resetError===e.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function Te(e,s){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${m(e)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${ie(s)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function Ce(e){if(!e||e==="unavailable"||e==="unknown")return"No schedule set";try{let s=new Date(e);return s.toLocaleDateString("en-US",{weekday:"short"})+" "+s.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return m(e)}}function ce(e,s,t,n,r){if(s.show_schedule===!1)return"";let a=n,o=e.states[`sensor.${a}_next_clean`],c=e.states[`binary_sensor.${a}_schedule_hold_active`];if(!o&&!c)return"";let i="";if(c){let d=c.state==="on",h=c.attributes.source==="presence_manager",g="rpc-badge-green",w="Schedule active",_="";d&&(h?(g="rpc-badge-blue",w="Away hold",_="\u{1F3C3}"):(g="rpc-badge-amber",w="Hold active",_="\u{1F512}")),i=`
      <button class="rpc-hold-badge ${g}"
              data-hold-action="${h?"tooltip":"toggle"}"
              aria-label="${m(w)}">
        ${r.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${_} ${w}`}
      </button>
      ${r.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let l="",p=s.presence_entities??[];if(p.length>0){let d=p.map(u=>{let h=e.states[u];if(!h)return"";let g=h.state==="home",w=h.attributes.friendly_name??u,_=m(w.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${g?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${_}
        <span class="rpc-presence-label">${g?"home":"away"}</span>
      </span>`}).join("");d&&(l=`<div class="rpc-presence-row">${d}</div>`)}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        ${o?`
          <div class="rpc-next-clean">
            <span class="rpc-schedule-label">Next scheduled</span>
            <span class="rpc-schedule-time">${Ce(o.state)}</span>
          </div>`:""}
        ${i}
      </div>
      ${l}
    </div>
  `}function pe(e,s,t,n){if(s.show_alerts===!1)return"";let r=n,a=[],o=e.states[`sensor.${r}_last_error_code`];if(o&&o.state!=="0"&&o.state!==""&&o.state!=="unavailable"){let l=m(o.attributes.description??"Robot error"),p=m(o.attributes.action??"");a.push({priority:1,text:`Error: ${l}`,subtext:p||void 0})}let c=e.states[`binary_sensor.${r}_maintenance_due`];if(c&&c.state==="on"){let l=e.states[`sensor.${r}_readiness`]?.state??"",p="Maintenance due";l==="bin_full"||l==="Bin Full"?p="Bin full \u2014 empty to continue":l&&l!=="Ready"&&l!=="unknown"&&l!=="unavailable"&&(p="Robot not ready \u2014 check the app"),a.push({priority:2,text:p})}if(t.hasWearRate){let l=e.states[`sensor.${r}_filter_wear_rate`],p=e.states[`sensor.${r}_filter_remaining_hours`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"&&p){let h=p.attributes.threshold_hours,g=parseFloat(l.state)/(h/90);g>1.5&&a.push({priority:3,text:`Filter wearing ${g.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup."})}let d=e.states[`sensor.${r}_brush_wear_rate`],u=e.states[`sensor.${r}_brush_remaining_hours`];if(d&&d.state!=="unknown"&&d.state!=="unavailable"&&u){let h=u.attributes.threshold_hours,g=parseFloat(d.state)/(h/90);g>1.5&&a.push({priority:4,text:`Brush wearing ${g.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles."})}}if(a.length===0)return"";let i=a.sort((l,p)=>l.priority-p.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${i.text}</div>
          ${i.subtext?`<div class="rpc-alert-sub">${i.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}var de={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"#e5e7eb"};function ze(e){return e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function ue(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function he(e,s,t){let i=new Map;for(let f of e)i.set(f.date,f);let l=new Date,p=[],d=new Date(l);d.setDate(l.getDate()-(s-1));let u=(d.getDay()+6)%7;d.setDate(d.getDate()-u);let h=Math.ceil((s+u)/7);for(let f=0;f<h;f++)for(let v=0;v<7;v++){let S=new Date(d);if(S.setDate(d.getDate()+f*7+v),S>l)continue;let k=ue(S);p.push({date:S,summary:i.get(k)??null,col:v,row:f})}let g=158,w=18+h*23-3+4,_=["Mo","Tu","We","Th","Fr","Sa","Su"],T=`<svg viewBox="0 0 ${g} ${w}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let f=0;f<7;f++){let v=f*23+10;T+=`<text x="${v}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary, #9ca3af)" font-family="inherit">${_[f]}</text>`}for(let f of p){let v=f.col*23,S=18+f.row*23,k=f.summary,x=k?.result??"none",C=de[x]??de.none,$=k?.total??0,b=ze(f.date);if($===0?b+=": no missions":$===1?b+=`: 1 mission, ${x}`:b+=`: ${$} missions, ${x}`,T+=`<g role="gridcell" aria-label="${b}" data-date="${ue(f.date)}" data-result="${x}" data-total="${$}" style="cursor:pointer">`,T+=`<rect x="${v-2}" y="${S-2}" width="24" height="24" fill="transparent" rx="3"/>`,T+=`<rect x="${v}" y="${S}" width="20" height="20" fill="${C}" rx="3"/>`,$>1){let D=Math.min($,3);for(let E=0;E<D;E++){let L=v+20-4-E*5,N=S+20-3;T+=`<circle cx="${L}" cy="${N}" r="1.5" fill="rgba(255,255,255,0.8)"/>`}}T+="</g>"}return T+="</svg>",T}function me(e=4){let o=18+e*23-3+4,c=["Mo","Tu","We","Th","Fr","Sa","Su"],i=`<svg viewBox="0 0 158 ${o}" xmlns="http://www.w3.org/2000/svg">`;i+="<style>@keyframes rpc-pulse{0%,100%{opacity:.4}50%{opacity:.8}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let l=0;l<7;l++){let p=l*23+10;i+=`<text x="${p}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary,#9ca3af)" font-family="inherit">${c[l]}</text>`}for(let l=0;l<e;l++)for(let p=0;p<7;p++){let d=p*23,u=18+l*23;i+=`<rect x="${d}" y="${u}" width="20" height="20" fill="#e5e7eb" rx="3" class="rpc-skel" style="animation-delay:${(l*7+p)*30}ms"/>`}return i+="</svg>",i}function ge(e,s){return s?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function fe(e,s,t,n,r,a){if(s.show_history===!1)return"";let o=n,c=s.history_days??28,i=s.area_unit??"auto",l=i==="m2"||i==="auto"&&a,p=e.states[`sensor.${o}_clean_streak`],d=e.states[`sensor.${o}_completion_rate_30d`],u=p?parseInt(p.state,10):0,h=d?parseInt(d.state,10):NaN,g="",w=[];u>0&&w.push(`\u{1F525} ${u}-day streak`),isNaN(h)||w.push(`${h}% completion rate`),w.length&&(g=`<div class="rpc-history-summary">${w.join(" \xB7 ")}</div>`);let _="";r.loading&&!r.data?_=me(Math.ceil(c/7)):r.error?_=`<div class="rpc-history-error">${m(r.error)}</div>`:r.data&&(_=he(r.data,c,i),r.data.length<c&&(_+=`<div class="rpc-history-partial">Showing ${r.data.length} of ${c} days \u2014 full history builds over time</div>`));let T="";if(t.hasProblemZone){let v=e.states[`sensor.${o}_problem_zone`],S=e.states[`sensor.${o}_stuck_count_30d`];if(v&&v.state!=="unknown"&&v.state!=="unavailable"){let k=S?parseInt(S.state,10):0;k>0&&(T=`<div class="rpc-problem-zone">\u26A0 ${m(v.state)} \u2014 stuck ${k}\xD7 in 30 days</div>`)}}let f="";if(r.openDay){let S=new Date(r.openDay+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),k=r.dayMissions,x=r.openDaySummary,C="";if(k===null)C="";else if(x&&x.total===0)C='<div class="rpc-day-empty">No missions this day</div>';else if(k.length>0)C=k.map(b=>{let D=b.result==="completed"?"\u2713":"\u2717",E=b.result==="completed"?"rpc-day-ok":"rpc-day-err",L=new Date(b.start_time).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}),N=b.area_sqft!==null?ge(b.area_sqft,l):"\u2014",Z=b.zones?.map(B=>m(B)).join(" \xB7 ")??"";return`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${E}">${D}</span>
            <span class="rpc-day-time">${L}</span>
            <span class="rpc-day-dur">${b.duration_min} min</span>
            <span class="rpc-day-area">${N}</span>
            ${Z?`<div class="rpc-day-zones">${Z}</div>`:""}
          </div>`}).join("");else if(x&&x.total>0){let b=x.area_sqft!==null?ge(x.area_sqft,l):null;C=`
        <div class="rpc-day-aggregate">
          <div>${x.total} mission${x.total>1?"s":""} \xB7 ${m(x.result)}
            ${b?` \xB7 ${b} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let $=x?.total??0;f=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${m(S)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${$>0&&k&&k.length>0?`<div class="rpc-day-count">${$} mission${$>1?"s":""}</div>`:""}
        ${C}
      </div>
    `}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${c} DAYS</div>
      ${g}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${_}
      </div>
      ${T}
      ${f}
    </div>
  `}function ye(e,s){let t=o=>!!e.states[`sensor.${s}_${o}`],n=o=>!!e.states[`select.${s}_${o}`],r=t("mop_pad"),a=t("brush_remaining_hours");return{hasArea:t("area_cleaned_today"),hasBrush:a,hasPad:r,hasWater:t("mop_tank_level"),hasCleanBase:t("clean_base_status"),hasZones:n("smart_zone_select")||n("zone_select"),hasSmartZones:n("smart_zone_select"),hasProblemZone:t("problem_zone"),hasLifetimeArea:t("lifetime_area"),hasWearRate:t("filter_wear_rate"),isMop:r&&!a}}var be=`
  :host {
    display: block;
    font-family: inherit;
    --rpc-green:          #2d9c4f;
    --rpc-amber:          #d97706;
    --rpc-red:            #dc2626;
    --rpc-blue:           #2563eb;
    --rpc-grey-light:     #e5e7eb;
    --rpc-grey-mid:       #9ca3af;
    --rpc-card-padding:   16px;
    --rpc-bar-height:     6px;
    --rpc-bar-row-height: 44px;
    --rpc-bar-radius:     3px;
    --rpc-dot-size:       8px;
    --rpc-cell-size:      20px;
    --rpc-cell-touch:     24px;
    --rpc-cell-gap:       3px;
  }

  .rpc-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    padding: var(--rpc-card-padding);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.1));
  }

  /* \u2500\u2500\u2500 Zones \u2500\u2500\u2500 */
  .rpc-zone { padding: 12px 0; }
  .rpc-zone + .rpc-zone { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }

  .rpc-zone-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 8px;
  }

  /* \u2500\u2500\u2500 Zone 1 \u2014 Status \u2500\u2500\u2500 */
  .rpc-robot-identity { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-robot-icon { font-size: 1.1rem; }
  .rpc-robot-name { font-size: 0.9rem; font-weight: 600; color: var(--secondary-text-color, #9ca3af); }

  .rpc-state-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .rpc-state-dot { font-size: 1.1rem; line-height: 1; }
  .rpc-state-dot.rpc-state-cleaning {
    color: var(--rpc-green);
    animation: rpc-blink 1.4s ease-in-out infinite;
  }
  .rpc-state-dot.rpc-state-error     { color: var(--rpc-red); }
  .rpc-state-dot.rpc-state-docked    { color: var(--rpc-green); }
  .rpc-state-dot.rpc-state-returning { color: var(--rpc-amber); }
  @keyframes rpc-blink { 0%,100%{opacity:1} 50%{opacity:.4} }

  .rpc-state-label { font-size: 1rem; font-weight: 500; }
  .rpc-error-state { border-left: 3px solid var(--rpc-red); padding-left: 10px; }
  .rpc-error-action, .rpc-error-zone {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin-top: 2px; margin-left: 28px;
  }

  /* Wave A3 \u2014 area-today */
  .rpc-area-today {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin: 2px 0 4px 28px;
  }

  /* Progress bar */
  .rpc-progress-track {
    height: 4px; background: var(--rpc-grey-light);
    border-radius: 2px; margin: 8px 0; overflow: hidden;
  }
  .rpc-progress-fill {
    height: 100%; background: var(--rpc-green);
    border-radius: 2px; transition: width 1s ease;
  }

  /* Metrics */
  .rpc-metrics-row { display: flex; gap: 20px; margin: 8px 0; }
  .rpc-metric { display: flex; flex-direction: column; gap: 2px; }
  .rpc-metric-val { font-size: 1.15rem; font-weight: 600; }
  .rpc-metric-lbl { font-size: 0.7rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; }
  .rpc-delta-up   { color: var(--rpc-green); }
  .rpc-delta-down { color: var(--rpc-amber); }
  .rpc-docked-since { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }

  /* Action buttons */
  .rpc-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .rpc-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; border: none;
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s; background: var(--primary-color, #2563eb); color: #fff;
    min-height: 36px; font-family: inherit;
  }
  .rpc-btn:hover:not(:disabled) { opacity: 0.85; }
  .rpc-btn:disabled, .rpc-btn-disabled { opacity: 0.45; cursor: default; }
  .rpc-btn-loading { opacity: 0.7; cursor: wait; }
  .rpc-btn-primary { width: 100%; padding: 10px; font-size: 0.9rem; }
  .rpc-btn-secondary {
    background: transparent; border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    color: var(--primary-text-color); width: 100%; margin-top: 10px;
  }
  .rpc-btn-text {
    background: none; border: none; color: var(--secondary-text-color);
    font-size: 0.8rem; cursor: pointer; padding: 4px 6px; font-family: inherit;
    margin-top: 4px; align-self: flex-end;
  }
  .rpc-btn-text:hover { color: var(--primary-text-color); }
  .rpc-send-error { font-size: 0.78rem; color: var(--rpc-red); margin-top: 6px; }

  /* Spinner */
  .rpc-spinner {
    width: 16px; height: 16px; flex-shrink: 0;
    animation: rpc-spin 0.8s linear infinite;
  }
  .rpc-spinner-sm { width: 12px; height: 12px; }
  @keyframes rpc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* \u2500\u2500\u2500 Zone 2 \u2014 Room Selector \u2500\u2500\u2500 */
  .rpc-chips-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
  .rpc-room-chip {
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid var(--primary-color, #2563eb);
    background: transparent; color: var(--primary-color, #2563eb);
    font-size: 0.82rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-room-chip--selected { background: var(--primary-color, #2563eb); color: #fff; }
  .rpc-selected-count { font-size: 0.78rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-passes-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-passes-label { font-size: 0.8rem; color: var(--secondary-text-color); margin-right: 4px; }
  .rpc-pass-chip {
    padding: 3px 10px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--primary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit; transition: background 0.12s;
  }
  .rpc-pass-chip--selected { background: var(--secondary-background-color, #f3f4f6); font-weight: 600; }
  .rpc-room-actions { display: flex; flex-direction: column; gap: 4px; }

  /* \u2500\u2500\u2500 Zone 3 \u2014 Health \u2500\u2500\u2500 */
  .rpc-bar-row {
    display: flex; align-items: center; min-height: var(--rpc-bar-row-height);
    gap: 8px; cursor: pointer; border-radius: 6px; padding: 0 2px;
    transition: background 0.12s;
  }
  .rpc-bar-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-bar-label { font-size: 0.82rem; color: var(--secondary-text-color); min-width: 65px; flex-shrink: 0; }
  .rpc-bar-track { flex: 1; height: var(--rpc-bar-height); background: var(--rpc-grey-light); border-radius: var(--rpc-bar-radius); overflow: hidden; }
  .rpc-bar-fill  { height: 100%; border-radius: var(--rpc-bar-radius); transition: width 0.4s ease; }
  .rpc-bar-pct   { font-size: 0.8rem; font-weight: 600; min-width: 36px; text-align: right; flex-shrink: 0; }
  .rpc-bar-hours { font-size: 0.78rem; color: var(--secondary-text-color); min-width: 30px; flex-shrink: 0; }
  .rpc-bar-arrow { font-size: 0.78rem; font-weight: 600; flex-shrink: 0; }
  .rpc-bar-cleanbase-state { font-size: 0.82rem; color: var(--secondary-text-color); flex: 1; }

  /* Wave A4 \u2014 Mop config row */
  .rpc-health-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 6px 0; }
  .rpc-mop-config { font-size: 0.82rem; color: var(--secondary-text-color); padding: 4px 2px; }

  /* \u2500\u2500\u2500 Popovers \u2500\u2500\u2500 */
  .rpc-popover {
    background: var(--secondary-background-color, #f9fafb);
    border: 1px solid var(--divider-color, rgba(0,0,0,.1));
    border-radius: 8px; padding: 12px; margin: 4px 0 6px;
    animation: rpc-expand 0.15s ease-out;
  }
  @keyframes rpc-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .rpc-popover-header {
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; font-size: 0.88rem; margin-bottom: 8px;
  }
  .rpc-popover-close {
    background: none; border: none; font-size: 1.1rem; cursor: pointer;
    color: var(--secondary-text-color); line-height: 1; padding: 0 4px; font-family: inherit;
  }
  .rpc-popover-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.1)); margin: 8px -12px; }
  .rpc-popover-row {
    display: flex; justify-content: space-between;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 6px;
  }
  .rpc-popover-row span:last-child { color: var(--primary-text-color); font-weight: 500; }
  .rpc-popover-bar-track { height: 8px; background: var(--rpc-grey-light); border-radius: 4px; overflow: hidden; margin: 8px 0; }
  .rpc-popover-bar-fill  { height: 100%; border-radius: 4px; }

  /* Day popover */
  .rpc-day-count   { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-day-empty   { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-day-mission { display: flex; align-items: baseline; gap: 8px; font-size: 0.82rem; margin-bottom: 6px; flex-wrap: wrap; }
  .rpc-day-icon  { font-weight: 700; flex-shrink: 0; }
  .rpc-day-ok    { color: var(--rpc-green); }
  .rpc-day-err   { color: var(--rpc-red); }
  .rpc-day-time  { font-weight: 500; }
  .rpc-day-dur, .rpc-day-area { color: var(--secondary-text-color); }
  .rpc-day-zones { width: 100%; padding-left: 20px; color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-day-aggregate { font-size: 0.82rem; }
  .rpc-day-no-detail { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px; }

  /* \u2500\u2500\u2500 Zone 4 \u2014 Schedule \u2500\u2500\u2500 */
  .rpc-schedule-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .rpc-next-clean { display: flex; flex-direction: column; gap: 2px; }
  .rpc-schedule-label { font-size: 0.75rem; color: var(--secondary-text-color); }
  .rpc-schedule-time  { font-size: 0.9rem; font-weight: 600; }
  .rpc-hold-badge {
    padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 500;
    border: none; cursor: pointer; font-family: inherit;
    display: inline-flex; align-items: center; gap: 4px;
    transition: opacity 0.15s; white-space: nowrap;
  }
  .rpc-hold-badge:hover { opacity: 0.8; }
  .rpc-badge-green { background: rgba(45,156,79,.15);  color: var(--rpc-green); }
  .rpc-badge-amber { background: rgba(217,119,6,.15);  color: var(--rpc-amber); }
  .rpc-badge-blue  { background: rgba(37,99,235,.15);  color: var(--rpc-blue); }
  .rpc-hold-tooltip {
    font-size: 0.78rem; color: var(--secondary-text-color);
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 6px 10px; margin-top: 4px;
    animation: rpc-expand 0.15s ease-out;
  }
  .rpc-presence-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .rpc-presence-dot { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; }
  .rpc-dot { display: inline-block; width: var(--rpc-dot-size); height: var(--rpc-dot-size); border-radius: 50%; flex-shrink: 0; }
  .rpc-dot-green { background: var(--rpc-green); }
  .rpc-dot-amber { background: var(--rpc-amber); }
  .rpc-presence-label { color: var(--secondary-text-color); }

  /* \u2500\u2500\u2500 Zone 5 \u2014 Alerts \u2500\u2500\u2500 */
  .rpc-zone5 { animation: rpc-expand 0.2s ease-out; }
  .rpc-alert-box {
    display: flex; gap: 10px; align-items: flex-start;
    background: rgba(220,38,38,.07); border: 1px solid rgba(220,38,38,.2);
    border-radius: 8px; padding: 10px 12px;
  }
  .rpc-alert-icon    { font-size: 1rem; flex-shrink: 0; line-height: 1.4; }
  .rpc-alert-text    { font-size: 0.85rem; font-weight: 500; }
  .rpc-alert-sub     { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* \u2500\u2500\u2500 Zone 6 \u2014 History \u2500\u2500\u2500 */
  .rpc-history-summary { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-heatmap-wrap { overflow: hidden; }
  .rpc-heatmap-wrap svg { width: 100%; height: auto; display: block; }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }
`,G=class extends HTMLElement{constructor(){super();this.robotName="";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.apiClient=null;this.prevVacuumState="";this.handleOutsideClick=t=>{if(!t.composedPath().includes(this)){let r=!1;this.openPopover!==null&&(this.openPopover=null,r=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,r=!0),r&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}setConfig(t){if(!t.entity)throw new Error("roomba-plus-card: entity is required");let n=this.config?.entity!==t.entity;this.config=t,this.robotName=t.entity.replace("vacuum.",""),n&&(this.apiClient=null,this.missionData=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.prevVacuumState="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(r=>{r!==null&&clearTimeout(r)})),this.root.innerHTML=`<style>${be}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(t){this._hass=t;let n=t.states[`select.${this.robotName}_cleaning_passes`];n&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=U[n.state]??"Auto");let r=t.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&r==="docked"&&this.loadHistory(),this.prevVacuumState=r,this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new W(t,this.config),this.loadHistory()):this.apiClient.updateHass(t),this.render()}async loadHistory(){if(!(!this.apiClient||this.historyLoading)){this.historyLoading=!0,this.historyError=null,this.render();try{let t=this.config.history_days??28;this.missionData=await this.apiClient.fetch(t)}catch(t){let n=t.message;this.historyError=n==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{this.historyLoading=!1,this.render()}}}render(){if(!this.config||!this._hass)return;let t=ye(this._hass,this.robotName),n=this._hass.config?.unit_system?.length==="m",r=new Date,a=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`,c=(this.missionData?.find(d=>d.date===a)??null)?.total??null,i=pe(this._hass,this.config,t,this.robotName),l=i;i?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=i):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),l=this.lastAlertHtml);let p=`
      <style>${be}</style>
      <div class="rpc-card">
        ${se({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:c})}
        ${ae({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError})}
        ${le(this._hass,this.config,t,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError})}
        ${ce(this._hass,this.config,t,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
        ${l}
        ${fe(this._hass,this.config,t,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary},n)}
      </div>
    `;this.root.innerHTML=p,this.attachEventListeners()}attachEventListeners(){let t=this.root.querySelector(".rpc-card");t.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.handleAction(r.dataset.action)})}),t.querySelectorAll("[data-room]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation();let o=r.dataset.room;this.selectedRooms.has(o)?this.selectedRooms.delete(o):this.selectedRooms.add(o),this.render()})}),t.querySelectorAll("[data-pass]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let o=r.dataset.pass,c=r.dataset.passOption;this.passes=o,this.render();let i=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[i]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:i,option:c})}catch{}finally{this.passSettingInFlight=!1}}})}),t.querySelectorAll("[data-bar]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation();let o=r.dataset.bar;this.openPopover=this.openPopover===o?null:o,this.resetError=null,this.render()})}),t.querySelectorAll("[data-close]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.openPopover=null,this.render()})}),t.querySelectorAll("[data-reset]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let o=r.dataset.reset,c=r.dataset.service;this.resetting=o,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",c,{entity_id:this.config.entity}),await new Promise(i=>setTimeout(i,800)),this.openPopover=null}catch{this.resetError=o}finally{this.resetting=null,this.render()}})}),t.querySelectorAll("[data-hold-action]").forEach(r=>{r.addEventListener("click",async a=>{if(a.stopPropagation(),r.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let o=`switch.${this.robotName}_schedule_hold`,c=this._hass.states[o]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:o})}finally{this.holdToggling=!1,this.render()}}})});let n=t.querySelector("[data-heatmap]");n&&n.addEventListener("click",r=>{r.stopPropagation();let a=r.target.closest("[data-date]");if(!a)return;let o=a.getAttribute("data-date");this.openDay===o?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=o,this.openDaySummary=this.missionData?.find(c=>c.date===o)??null,this.dayMissions=this.buildDayMissions(o)),this.render()}),t.querySelectorAll("[data-close-day]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})})}buildDayMissions(t){let n=this.missionData?.find(r=>r.date===t);return!n||n.total===0?[]:n.missions&&n.missions.length>0?n.missions:[]}async handleAction(t){let{entity:n}=this.config,r=this.robotName;if(t==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let l=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${r}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:j[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:n,room_name:l,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(t==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${r}_repeat_mission`})}catch{}return}let o={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"]}[t];if(!o)return;let[c,i]=o;if(this.loadingAction=t,this.render(),t==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(c,i,{entity_id:n})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(c,i,{entity_id:n})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let t=ye(this._hass,this.robotName),n=4;return t.hasZones&&this.config.show_rooms!==!1&&(n+=3),this.config.show_health!==!1&&(n+=2),this.config.show_schedule!==!1&&(n+=2),this.config.show_history!==!1&&(n+=4),n}static getConfigElement(){return document.createElement("roomba-plus-card-editor")}static getStubConfig(){return{entity:"vacuum.roomba"}}};customElements.define("roomba-plus-card",G);window.customCards??(window.customCards=[]);window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/your-org/roomba-plus-card"});
