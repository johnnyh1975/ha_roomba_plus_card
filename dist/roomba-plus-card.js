function J(t,r){let e=l=>!!t.states[`sensor.${r}_${l}`],o=l=>!!t.states[`select.${r}_${l}`],n=l=>!!t.states[`binary_sensor.${r}_${l}`],s=e("mop_pad"),a=e("brush_remaining_hours");return{hasArea:e("area_cleaned_today"),hasBrush:a,hasPad:s,hasWater:e("mop_tank_level"),hasCleanBase:e("clean_base_status"),hasZones:o("smart_zone_select")||o("zone_select"),hasSmartZones:o("smart_zone_select"),hasProblemZone:e("problem_zone"),hasLifetimeArea:e("lifetime_area"),hasWearRate:e("filter_wear_rate"),isMop:s&&!a,hasMissionActive:n("mission_active"),hasMissionPhase:e("mission_phase"),hasDemandBlocked:n("demand_clean_blocked"),hasEnergyConsumption:e("total_energy_consumed")}}var j=class{constructor(r,e,o){this.hass=r;this.config=e;this.entryId=null;this.entityId=o??e.entity}updateHass(r){this.hass=r}async fetchSummary(r){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${r}`,n=await this.hass.fetchWithAuth(o);if(!n.ok)throw new Error(`${n.status}`);return n.json()}async fetchRecords(r){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${r}`,n=await this.hass.fetchWithAuth(o);return n.ok?n.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let r=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=r.config_entry_id,this.entryId}};function g(t){return String(t??"").replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}function q(t,r){return t.states[r]?.state??"unavailable"}function ie(t,r,e){return r==="m2"||r==="auto"&&e?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function K(t){let r=Date.now()-new Date(t).getTime(),e=Math.floor(r/6e4);if(e<1)return"just now";if(e<60)return`${e}m ago`;let o=Math.floor(e/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function Te(t){if(!t)return null;for(let r=t.length-1;r>=0;r--){let e=t[r];if(e.missions&&e.missions.length>0)for(let o=e.missions.length-1;o>=0;o--){let n=e.missions[o];if(n.result==="completed")return K(n.started_at)}else if(e.completed>0)return K(e.date+"T12:00:00Z")}return null}function Ce(t){let r=["th","st","nd","rd"],e=t%100;return t+(r[(e-20)%10]??r[e]??r[0])}function le(t){let{hass:r,config:e,caps:o,robotName:n,loadingAction:s,todayMissionCount:a}=t,l=e.entity,i=q(r,l),c=r.states[l]?.attributes??{},p=r.config?.unit_system?.length==="m",d=e.area_unit??"auto",u=i==="unavailable",f=s!==null,$=n,T=`sensor.${$}_last_error_code`,A=`sensor.${$}_last_error_zone`,C=`sensor.${$}_mission_recharge_time`,h=`sensor.${$}_missions_last_30d`,x=`sensor.${$}_average_area_30d`,m=`sensor.${$}_area_cleaned_today`,y=c.mission_elapsed_min??null,v=c.mission_area_sqft??null,b=parseFloat(q(r,h)),w=isNaN(b)||b<=0?45:b,E=parseFloat(q(r,x)),S=o.isMop,L=S?"\u{1F9F9}":"\u{1F916}",O=g(c.friendly_name??l),B=r.states[`sensor.${$}_mission_phase`]?.state??"",k=(r.states[`binary_sensor.${$}_mission_active`]?.state??"")==="on",P=o.hasMissionActive,M=r.states[`sensor.${$}_mission_expire_time`]?.state??"",Z=M&&M!=="unavailable"&&M!=="unknown"?new Date(M):null,te=!!Z&&!isNaN(Z.getTime())&&Z>new Date,se=te?Math.max(1,Math.round((Z.getTime()-Date.now())/6e4)):null,W=!1;if(P)W=i==="docked"&&k;else{let _=q(r,C);W=i==="docked"&&(_!=="unavailable"&&_!=="unknown"&&M!=="unavailable"&&M!=="unknown")&&te}let N="",H="",Y="";if(B==="evac")N="\u2B06",H="Emptying bin";else if(W)N="\u26A1",H=se!==null?`Recharging \u2014 resuming in ~${se} min`:"Recharging \u2014 mission continues";else switch(i){case"cleaning":N="\u25CF",H=S?"Mopping":"Cleaning";break;case"paused":N="\u23F8",H="Paused";break;case"returning":N="\u21A9",H="Returning to dock";break;case"docked":N="\u2713",H="Docked";break;case"idle":N="\u25CB",H="Idle";break;case"error":N="\u26A0",H="Error",Y="rpc-error-state";break;case"unavailable":N="\u2014",H="Unavailable";break}let re="";if(i==="error"){let _=r.states[T];if(_&&_.state!=="0"&&_.state!==""&&_.state!=="unavailable"){let R=g(_.attributes.description??"Unknown error"),D=g(_.attributes.action??""),I=q(r,A),G=I&&I!=="unknown"&&I!=="unavailable";H=`Error ${g(_.state)} \u2014 ${R}`,re=`
        ${D?`<div class="rpc-error-action">${D}</div>`:""}
        ${G?`<div class="rpc-error-zone">Zone: ${g(I)}</div>`:""}
      `}else H="Robot error \u2014 check the iRobot app"}let ae="";if((P?k:i==="cleaning"||W)&&o.hasArea){let _=parseFloat(q(r,m));if(!isNaN(_)&&_>0){let R=ie(_,d,p),D=a!==null?a+1:null,I=D!==null&&D>1?` \xB7 ${g(Ce(D))} mission`:"";ae=`<div class="rpc-area-today">${R} already today${I}</div>`}}let ne="";i==="cleaning"&&y!==null&&(ne=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(y/w*100,95)}%"></div></div>`);let oe="";if(i==="cleaning"){let _=[];if(y!==null){let R=Math.max(0,Math.round(w-y));_.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${R} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(o.hasArea&&v!==null&&(_.push(`<div class="rpc-metric"><span class="rpc-metric-val">${ie(v,d,p)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`),!isNaN(E)&&E>0)){let R=parseFloat(q(r,`sensor.${$}_mission_count_30d`));if(!isNaN(R)&&R>=5){let D=Math.round((v-E)/E*100),I=D>=0?"\u25B2":"\u25BC",G=D>=0?"rpc-delta-up":"rpc-delta-down";_.push(`<div class="rpc-metric"><span class="rpc-metric-val ${G}">${I} ${Math.abs(D)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}_.length&&(oe=`<div class="rpc-metrics-row">${_.join("")}</div>`)}let U="";if(i==="docked"&&!W){let _=Te(t.missionData);if(_)U=`<div class="rpc-docked-since">Last cleaned: ${_}</div>`;else{let R=r.states[l]?.last_changed;R&&(U=`<div class="rpc-docked-since">Last mission: ${K(R)}</div>`)}if(o.hasDemandBlocked){let R=`binary_sensor.${n}_demand_clean_blocked`;r.states[R]?.state==="on"&&(U+='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>')}}let ke='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',F=(_,R,D)=>{let I=s===_;return`<button class="rpc-btn${I?" rpc-btn-loading":""}"
      data-action="${_}"
      ${u||f?"disabled":""}
      aria-label="${R}">
      ${I?ke:D}
    </button>`},V="";return i==="cleaning"||B==="evac"?V=F("pause","Pause","\u23F8 Pause")+F("return_home","Return home","\u21A9 Return home"):i==="paused"?V=F("resume","Resume","\u25B6 Resume")+F("return_home","Return home","\u21A9 Return home"):W?V=F("return_home","Cancel mission","\u2715 Cancel mission"):i!=="returning"&&!u&&(V=F("start","Start","\u25B6 Start")+F("locate","Locate","\u2299 Locate")),`
    <div class="rpc-zone rpc-zone1${Y?" "+Y:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${L}</span>
        <span class="rpc-robot-name">${O}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${i}">${N}</span>
        <span class="rpc-state-label">${H}</span>
      </div>
      ${ae}
      ${re}
      ${ne}
      ${oe}
      ${U}
      ${V?`<div class="rpc-actions">${V}</div>`:""}
    </div>
  `}var ce={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},pe="\u{1F4CD}";var Q={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},de={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function ue(t){let{hass:r,config:e,caps:o,robotName:n,selectedRooms:s,passes:a,isSending:l,sendError:i,settingsPanelOpen:c}=t;if(!o.hasZones||e.show_rooms===!1)return"";let p=n,d=r.states[`select.${p}_smart_zone_select`],u=r.states[`select.${p}_zone_select`],f=d??u;if(!f)return"";let $=f.attributes.options??[];if($.length===0)return"";let T=r.states[`button.${p}_repeat_mission`],A=!!T&&T.state!=="unavailable",C=r.states[`select.${p}_cleaning_passes`],h=r.states[`switch.${p}_edge_clean`],x=r.states[`switch.${p}_always_finish`],m=r.states[`select.${p}_carpet_boost_mode`],y=!!(h||x||m),b=o.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",w=s.size,E='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',S=(()=>{let z=o.hasSmartZones?`select.${n}_smart_zone_select`:`select.${n}_zone_select`,k=r.states[z]?.attributes?.region_icons;return k&&typeof k=="object"&&!Array.isArray(k)?k:{}})(),L=$.map(z=>{let k=s.has(z),P=S[z],M=P?ce[P]??pe:"",Z=M?`${M} ${g(z)}`:g(z);return`<button class="rpc-room-chip${k?" rpc-room-chip--selected":""}"
      data-room="${g(z)}" aria-pressed="${k}">${Z}</button>`}).join(""),O="";if(C){let z=a;O=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(k=>`<button class="rpc-pass-chip${z===k?" rpc-pass-chip--selected":""}"
            data-pass="${k}"
            data-pass-option="${g(Q[k]??k)}">${k}</button>`).join("")}
      </div>
    `}let B="";if(y){let z="";if(c){let k=h?.state==="on",P=x?.state==="on",M=m?m.attributes.options??[]:[];z=`
        <div class="rpc-settings-panel">
          ${h?`
            <div class="rpc-setting-item">
              <span class="rpc-setting-label">Edge clean</span>
              <button class="rpc-setting-toggle${k?" rpc-setting-on":""}"
                      data-switch-entity="switch.${p}_edge_clean"
                      aria-pressed="${k}">
                ${k?"\u25CF":"\u25CB"}
              </button>
            </div>`:""}
          ${x?`
            <div class="rpc-setting-item">
              <span class="rpc-setting-label">Always finish</span>
              <button class="rpc-setting-toggle${P?" rpc-setting-on":""}"
                      data-switch-entity="switch.${p}_always_finish"
                      aria-pressed="${P}">
                ${P?"\u25CF":"\u25CB"}
              </button>
            </div>`:""}
          ${m?`
            <div class="rpc-setting-item">
              <span class="rpc-setting-label">Carpet boost</span>
              <button class="rpc-setting-cycle"
                      data-cycle-entity="select.${p}_carpet_boost_mode"
                      data-cycle-options="${g(JSON.stringify(M))}"
                      data-cycle-current="${g(m.state)}">
                ${g(m.state)} \u25BC
              </button>
            </div>`:""}
        </div>
      `}B=`
      <div class="rpc-settings-divider"></div>
      <button class="rpc-settings-row" data-settings-toggle aria-expanded="${c}">
        <span class="rpc-settings-icon">\u2699</span>
        <span class="rpc-settings-label">Settings</span>
        <span class="rpc-settings-arrow">${c?"\u25B2":"\u25BC"}</span>
      </button>
      ${z}
    `}return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${L}
        ${w>0?`<span class="rpc-selected-count">${w} selected</span>`:""}
      </div>
      ${O}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${w===0||l?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${w===0||l?"disabled":""}
                aria-label="${b}">
          ${l?E+" Sending\u2026":b}
        </button>
        ${A?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${i?`<div class="rpc-send-error">${g(i)}</div>`:""}
      ${B}
    </div>
  `}function he(t,r){return Math.min(100,Math.max(0,Math.round(t/r*100)))}function me(t,r){return r==="battery"?t>20?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)":r==="tank"?t>40?"var(--rpc-green)":t>20?"var(--rpc-amber)":"var(--rpc-red)":t>50?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)"}function Ee(t,r){let e=r/90;if(!e)return"";let o=t/e;return o>1.2?"\u2191":o<.8?"\u2193":"\u2192"}function Re(t){let r=Math.floor((Date.now()-new Date(t).getTime())/864e5);return r===0?"today":r===1?"yesterday":`${r} days ago`}function ge(t){let r=parseInt(t,10);return!isNaN(r)&&r>=0?`~${r} use${r!==1?"s":""} remaining`:t==="Empty"?"Bag full \u2014 replace soon":t==="Full"?"Bag has capacity":g(t)}function fe(t,r,e,o,n){if(r.show_health===!1)return"";let s=o,a=[];t.states[`sensor.${s}_filter_remaining_hours`]&&a.push({key:"filter",label:"Filter",sensorId:`sensor.${s}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${s}_filter_last_replaced`}),e.hasBrush&&t.states[`sensor.${s}_brush_remaining_hours`]&&a.push({key:"brush",label:"Brush",sensorId:`sensor.${s}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${s}_brush_last_replaced`}),e.hasPad&&t.states[`sensor.${s}_mop_pad_remaining_hours`]&&a.push({key:"pad",label:"Pad",sensorId:`sensor.${s}_mop_pad_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${s}_pad_last_replaced`}),e.hasWater&&t.states[`sensor.${s}_mop_tank_level`]&&a.push({key:"tank",label:"Tank",sensorId:`sensor.${s}_mop_tank_level`,thresholdAttr:null,type:"tank"});let l=t.states[`sensor.${s}_battery_level`]?`sensor.${s}_battery_level`:t.states[`sensor.${s}_battery`]?`sensor.${s}_battery`:null,i=l?void 0:t.states[`vacuum.${s}`]?.attributes?.battery_level;if((l||i!==void 0)&&a.push({key:"battery",label:"Battery",sensorId:l??"",thresholdAttr:null,type:"battery",rawPct:i}),e.hasCleanBase&&t.states[`sensor.${s}_clean_base_status`]&&a.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${s}_clean_base_status`,thresholdAttr:null,type:"cleanbase"}),a.length===0)return"";let c=a.map(d=>ze(d,t,s,n)).join(""),p="";if(e.isMop){let d=t.states[`sensor.${s}_mop_pad`],u=t.states[`sensor.${s}_mop_behavior`],f=[];d&&d.state!=="unknown"&&d.state!=="unavailable"&&f.push(g(d.state)),u&&u.state!=="unknown"&&u.state!=="unavailable"&&f.push(`${g(u.state)} intensity`),f.length&&(p=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${f.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${c}
      ${p}
    </div>
  `}function ze(t,r,e,o){let n=o.openPopover===t.key;if(t.type==="cleanbase"){let u=r.states[t.sensorId];return u?`
      <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${n}" tabindex="0"
           aria-label="${t.label}">
        <span class="rpc-bar-label">${t.label}</span>
        <span class="rpc-bar-cleanbase-state">${ge(u.state)}</span>
      </div>
      ${n?Me(t.label,u.state):""}
    `:""}let s=0,a="",l="",i=null;if(t.rawPct!==void 0)s=Math.min(100,Math.max(0,t.rawPct)),a=`${Math.round(s)}%`;else{let u=r.states[t.sensorId];if(!u)return"";let f=parseFloat(u.state);if(isNaN(f))return"";if(t.type==="tank"||t.type==="battery")s=Math.min(100,Math.max(0,f)),a=`${Math.round(s)}%`;else{if(i=t.thresholdAttr?u.attributes[t.thresholdAttr]:null,!i)return"";s=he(f,i),a=`${s}%`,l=`${Math.round(f)}h`}}let c=me(s,t.type),p="";if(t.wearSensorId&&i){let u=r.states[t.wearSensorId];u&&u.state!=="unknown"&&u.state!=="unavailable"&&(p=Ee(parseFloat(u.state),i))}let d=t.rawPct!==void 0?{state:String(Math.round(t.rawPct)),attributes:{}}:r.states[t.sensorId];return`
    <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${n}" tabindex="0"
         aria-label="${t.label} \u2014 ${a}">
      <span class="rpc-bar-label">${t.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${s}%;background:${c}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${c}">${a}</span>
      ${l?`<span class="rpc-bar-hours">${l}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${c}">${p}</span>`:""}
    </div>
    ${n&&d?Ae(t,d,i,r,o):""}
  `}function Ae(t,r,e,o,n){let s=parseFloat(r.state),a=e?he(s,e):Math.min(100,Math.max(0,s)),l=me(a,t.type),i=n.resetting===t.key,c=t.lastReplacedId?o.states[t.lastReplacedId]:null,p="";c&&c.state!=="unavailable"&&c.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(c.state).toLocaleDateString()} (${Re(c.state)})</span>
      </div>`);let d="";if(t.wearSensorId&&!n.legendShown){let f=o.states[t.wearSensorId];f&&f.state!=="unknown"&&f.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${g(t.label)}</span>
        <button class="rpc-popover-close" data-close="${t.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${e?`<div class="rpc-popover-row"><span>Threshold</span><span>${e} h</span></div>`:""}
      ${e?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(s)} h (${a}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${a}%;background:${l}"></div>
      </div>
      ${d}
      ${t.resetService?`
        <button class="rpc-btn rpc-btn-secondary${i?" rpc-btn-loading":""}"
                data-reset="${t.key}" data-service="${t.resetService}"
                ${i?"disabled":""}>
          ${i?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${n.resetError===t.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function Me(t,r){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${g(t)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${ge(r)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function He(t){if(!t||t==="unavailable"||t==="unknown")return"No schedule set";try{let r=new Date(t);return r.toLocaleDateString("en-US",{weekday:"short"})+" "+r.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return g(t)}}function De(t){if(!t||t==="unavailable"||t==="unknown")return"";try{let r=new Date(t);if(isNaN(r.getTime()))return"";let e=r.toLocaleDateString("en-US",{weekday:"short"}),o=r.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1});return`${e} ~${o}`}catch{return""}}function ye(t,r,e,o,n){if(r.show_schedule===!1)return"";let s=o,a=t.states[`sensor.${s}_next_clean`],l=t.states[`binary_sensor.${s}_schedule_hold_active`],i=t.states[`sensor.${s}_presence_clean_opportunities_7d`],c=t.states[`sensor.${s}_presence_clean_utilisation_7d`],p=t.states[`sensor.${s}_next_likely_clean_window`],d=!!i&&!!c&&i.state!=="unknown"&&i.state!=="unavailable"&&c.state!=="unknown"&&c.state!=="unavailable",u=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!a&&!l&&!d&&!u)return"";let f="";if(l){let h=l.state==="on",m=l.attributes.source==="presence_manager",y="rpc-badge-green",v="Schedule active",b="";h&&(m?(y="rpc-badge-blue",v="Away hold",b="\u{1F3C3}"):(y="rpc-badge-amber",v="Hold active",b="\u{1F512}")),f=`
      <button class="rpc-hold-badge ${y}"
              data-hold-action="${m?"tooltip":"toggle"}"
              aria-label="${g(v)}">
        ${n.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${b} ${v}`}
      </button>
      ${n.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let $="";if(u){let h=De(p.state);h&&($=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${h}</span>
        </div>
      `)}let T="",A=r.presence_entities??[];if(A.length>0){let h=A.map(x=>{let m=t.states[x];if(!m)return"";let y=m.state==="home",v=m.attributes.friendly_name??x,b=g(v.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${y?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${b}
        <span class="rpc-presence-label">${y?"home":"away"}</span>
      </span>`}).join("");h&&(T=`<div class="rpc-presence-row">${h}</div>`)}let C="";if(d){let h=parseInt(i.state,10),x=parseInt(c.state,10);if(!isNaN(h)&&!isNaN(x)){let m=`${h} opportunit${h!==1?"ies":"y"} this week`,y=`${x}% utilised`;C=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${m} \xB7 ${y}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${a?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${He(a.state)}</span>
            </div>`:""}
          ${$}
        </div>
        ${f}
      </div>
      ${T}
      ${C}
    </div>
  `}function ve(t,r,e,o){if(r.show_alerts===!1)return"";let n=o,s=[],a=t.states[`sensor.${n}_last_error_code`];if(a&&a.state!=="0"&&a.state!==""&&a.state!=="unavailable"){let p=g(a.attributes.description??"Robot error"),d=g(a.attributes.action??"");s.push({priority:1,text:`Error: ${p}`,subtext:d||void 0})}let l=t.states[`binary_sensor.${n}_maintenance_due`];if(l&&l.state==="on"){let p=t.states[`sensor.${n}_readiness`]?.state??"",d="Maintenance due";p==="bin_full"||p==="Bin Full"?d="Bin full \u2014 empty to continue":p&&p!=="Ready"&&p!=="unknown"&&p!=="unavailable"&&(d="Robot not ready \u2014 check the app"),s.push({priority:2,text:d})}if(e.hasWearRate){let p=t.states[`sensor.${n}_filter_wear_rate`],d=t.states[`sensor.${n}_filter_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let $=d.attributes.threshold_hours,T=parseFloat(p.state)/($/90);T>1.5&&s.push({priority:3,text:`Filter wearing ${T.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup."})}let u=t.states[`sensor.${n}_brush_wear_rate`],f=t.states[`sensor.${n}_brush_remaining_hours`];if(u&&u.state!=="unknown"&&u.state!=="unavailable"&&f){let $=f.attributes.threshold_hours,T=parseFloat(u.state)/($/90);T>1.5&&s.push({priority:4,text:`Brush wearing ${T.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles."})}}let i=t.states[`sensor.${n}_nav_quality`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"){let p=parseInt(i.state,10);!isNaN(p)&&p<60&&s.push({priority:5,text:`Navigation quality low (${p}/100)`,subtext:"Check lighting or move obstacles in the cleaning area."})}if(s.length===0)return"";let c=s.sort((p,d)=>p.priority-d.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${c.text}</div>
          ${c.subtext?`<div class="rpc-alert-sub">${c.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}var be={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"#e5e7eb"};function Le(t){return t.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function _e(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function xe(t,r,e){let i=new Map;for(let h of t)i.set(h.date,h);let c=new Date,p=[],d=new Date(c);d.setDate(c.getDate()-(r-1));let u=(d.getDay()+6)%7;d.setDate(d.getDate()-u);let f=Math.ceil((r+u)/7);for(let h=0;h<f;h++)for(let x=0;x<7;x++){let m=new Date(d);if(m.setDate(d.getDate()+h*7+x),m>c)continue;let y=_e(m);p.push({date:m,summary:i.get(y)??null,col:x,row:h})}let $=7*23-3,T=18+f*23-3+4,A=["Mo","Tu","We","Th","Fr","Sa","Su"],C=`<svg viewBox="0 0 ${$} ${T}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let h=0;h<7;h++){let x=h*23+10;C+=`<text x="${x}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary, #9ca3af)" font-family="inherit">${A[h]}</text>`}for(let h of p){let x=h.col*23,m=18+h.row*23,y=h.summary,v=y?.result??"none",b=be[v]??be.none,w=y?.total??0,E=Le(h.date);if(w===0?E+=": no missions":w===1?E+=`: 1 mission, ${v}`:E+=`: ${w} missions, ${v}`,C+=`<g role="gridcell" aria-label="${E}" data-date="${_e(h.date)}" data-result="${v}" data-total="${w}" style="cursor:pointer">`,C+=`<rect x="${x-2}" y="${m-2}" width="24" height="24" fill="transparent" rx="3"/>`,C+=`<rect x="${x}" y="${m}" width="20" height="20" fill="${b}" rx="3"/>`,w>1){let S=Math.min(w,3);for(let L=0;L<S;L++){let O=x+20-4-L*5,B=m+20-3;C+=`<circle cx="${O}" cy="${B}" r="1.5" fill="rgba(255,255,255,0.8)"/>`}}C+="</g>"}return C+="</svg>",C}function $e(t=4){let a=18+t*23-3+4,l=["Mo","Tu","We","Th","Fr","Sa","Su"],i=`<svg viewBox="0 0 158 ${a}" xmlns="http://www.w3.org/2000/svg">`;i+="<style>@keyframes rpc-pulse{0%,100%{opacity:.4}50%{opacity:.8}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let c=0;c<7;c++){let p=c*23+10;i+=`<text x="${p}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary,#9ca3af)" font-family="inherit">${l[c]}</text>`}for(let c=0;c<t;c++)for(let p=0;p<7;p++){let d=p*23,u=18+c*23;i+=`<rect x="${d}" y="${u}" width="20" height="20" fill="#e5e7eb" rx="3" class="rpc-skel" style="animation-delay:${(c*7+p)*30}ms"/>`}return i+="</svg>",i}function X(t,r){return r?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function we(t,r,e,o,n,s){if(r.show_history===!1)return"";let a=o,l=r.history_days??28,i=r.area_unit??"auto",c=i==="m2"||i==="auto"&&s,p=t.states[`sensor.${a}_clean_streak`],d=t.states[`sensor.${a}_completion_rate_30d`],u=p?parseInt(p.state,10):0,f=d?parseInt(d.state,10):NaN,$="",T=[];u>0&&T.push(`\u{1F525} ${u}-day streak`),isNaN(f)||T.push(`${f}% completion rate`),T.length&&($=`<div class="rpc-history-summary">${T.join(" \xB7 ")}</div>`);let A="";n.loading&&!n.data?A=$e(Math.ceil(l/7)):n.error?A=`<div class="rpc-history-error">${g(n.error)}</div>`:n.data&&(A=xe(n.data,l,i),n.data.length<l&&(A+=`<div class="rpc-history-partial">Showing ${n.data.length} of ${l} days \u2014 full history builds over time</div>`));let C="";if(e.hasProblemZone){let m=t.states[`sensor.${a}_problem_zone`],y=t.states[`sensor.${a}_stuck_count_30d`];if(m&&m.state!=="unknown"&&m.state!=="unavailable"){let v=y?parseInt(y.state,10):0;v>0&&(C=`<div class="rpc-problem-zone">\u26A0 ${g(m.state)} \u2014 stuck ${v}\xD7 in 30 days</div>`)}}let h="";if(n.openDay){let y=new Date(n.openDay+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),v=n.dayMissions,b=n.openDaySummary,w="";if(v===null)w="";else if(b&&b.total===0)w='<div class="rpc-day-empty">No missions this day</div>';else if(v.length>0)w=v.map(S=>{let L=S.result==="completed"?"\u2713":"\u2717",O=S.result==="completed"?"rpc-day-ok":"rpc-day-err",B=new Date(S.started_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}),z=S.area_sqft!==null?X(S.area_sqft,c):"\u2014",k=S.zones?.map(Z=>g(Z)).join(" \xB7 ")??"",P=r.show_dirt_events&&S.dirt_events!=null&&S.dirt_events>0?`${S.dirt_events} dirt event${S.dirt_events!==1?"s":""}`:"",M=[k,P].filter(Boolean).join(" \xB7 ");return`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${O}">${L}</span>
            <span class="rpc-day-time">${B}</span>
            <span class="rpc-day-dur">${S.duration_min} min</span>
            <span class="rpc-day-area">${z}</span>
            ${M?`<div class="rpc-day-zones">${M}</div>`:""}
          </div>`}).join("");else if(b&&b.total>0){let S=b.area_sqft!==null?X(b.area_sqft,c):null;w=`
        <div class="rpc-day-aggregate">
          <div>${b.total} mission${b.total>1?"s":""} \xB7 ${g(b.result)}
            ${S?` \xB7 ${S} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let E=b?.total??0;h=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${g(y)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${E>0&&v&&v.length>0?`<div class="rpc-day-count">${E} mission${E>1?"s":""}</div>`:""}
        ${w}
      </div>
    `}let x="";if(r.show_lifetime!==!1){let m=t.states[`sensor.${a}_lifetime_missions`],y=t.states[`sensor.${a}_lifetime_area`],v=t.states[`sensor.${a}_lifetime_time`];if(m&&y&&v){let b=parseInt(m.state,10),w=parseInt(v.state,10),E=parseFloat(y.state),S=isNaN(E)?null:X(E,c),L=n.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(b)?"":`<span>${b.toLocaleString()} missions</span>`}
          ${S?`<span>${S}</span>`:""}
          ${isNaN(w)?"":`<span>${w.toLocaleString()} h</span>`}
        </div>`:"";x=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${n.lifetimeExpanded}">
          Lifetime ${n.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${L}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${l} DAYS</div>
      ${$}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${A}
      </div>
      ${C}
      ${h}
      ${x}
    </div>
  `}var Se=`
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
  .rpc-robot-selector { margin-bottom: 10px; }
  .rpc-robot-select { width: 100%; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer; }
  .rpc-docked-since { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-demand-blocked { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 4px; }

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

  /* Wear legend */
  .rpc-wear-legend {
    display: flex; flex-direction: column; gap: 3px;
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 8px 10px; margin: 8px 0;
    font-size: 0.78rem; color: var(--secondary-text-color);
  }
  .rpc-wear-legend-title {
    font-weight: 600; color: var(--primary-text-color);
    margin-bottom: 2px; font-size: 0.8rem;
  }

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

  /* \u2500\u2500\u2500 Wave B/C additions \u2500\u2500\u2500 */

  /* B1 \u2014 Presence analytics */
  .rpc-schedule-times { display: flex; flex-direction: column; gap: 4px; }
  .rpc-next-clean--likely .rpc-schedule-time { color: var(--secondary-text-color); }
  .rpc-schedule-time--approx { font-style: italic; }
  .rpc-presence-analytics {
    font-size: 0.78rem; color: var(--secondary-text-color);
    margin-top: 6px; padding: 4px 2px;
  }

  /* B3 \u2014 Settings panel */
  .rpc-settings-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-settings-row {
    display: flex; align-items: center; gap: 6px; width: 100%;
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.8rem; color: var(--secondary-text-color);
    padding: 8px 2px; text-align: left;
  }
  .rpc-settings-row:hover { color: var(--primary-text-color); }
  .rpc-settings-icon { font-size: 0.9rem; }
  .rpc-settings-label { flex: 1; }
  .rpc-settings-arrow { font-size: 0.7rem; }

  .rpc-settings-panel {
    display: flex; flex-wrap: wrap; gap: 6px 16px;
    padding: 8px 2px 4px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-setting-item { display: flex; align-items: center; gap: 6px; }
  .rpc-setting-label { font-size: 0.8rem; color: var(--secondary-text-color); }
  .rpc-setting-toggle {
    background: none; border: none; cursor: pointer; font-size: 0.9rem;
    color: var(--secondary-text-color); font-family: inherit; padding: 2px 4px;
    border-radius: 4px; transition: color 0.12s;
  }
  .rpc-setting-toggle:hover { color: var(--primary-text-color); }
  .rpc-setting-on { color: var(--rpc-green) !important; }
  .rpc-setting-cycle {
    background: var(--secondary-background-color, #f3f4f6);
    border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    border-radius: 6px; padding: 3px 8px; font-size: 0.78rem;
    cursor: pointer; font-family: inherit; color: var(--primary-text-color);
  }
  .rpc-setting-cycle:hover { opacity: 0.8; }

  /* C1 \u2014 Lifetime stats */
  .rpc-lifetime-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-lifetime-toggle {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.78rem; color: var(--secondary-text-color);
    padding: 8px 2px; width: 100%; text-align: left;
  }
  .rpc-lifetime-toggle:hover { color: var(--primary-text-color); }
  .rpc-lifetime-stats {
    display: flex; gap: 12px; flex-wrap: wrap;
    font-size: 0.82rem; color: var(--secondary-text-color);
    padding: 2px 2px 6px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-lifetime-arrow { color: var(--secondary-text-color); }
  .rpc-lifetime-stats span { white-space: nowrap; }
  .rpc-history-summary { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-heatmap-wrap { overflow: hidden; }
  .rpc-heatmap-wrap svg { width: 100%; height: auto; display: block; }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }
`,ee=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=e=>{if(!e.composedPath().includes(this)){let n=!1;this.openPopover!==null&&(this.openPopover=null,n=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,n=!0),n&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)})}setConfig(e){let o=e.entities&&e.entities.length>0?e.entities:[e.entity];if(!o[0])throw new Error("roomba-plus-card: entity is required");let n=this.activeRobot,s=o.includes(n)?n:o[0],a=s!==n;this.config=e,this.activeRobot=s,this.robotName=s.replace("vacuum.",""),a&&this.resetRobotState(),this.root.innerHTML=`<style>${Se}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(e){let o=this.relevantEntityIds(),n=!this._hass||o.some(c=>e.states[c]?.state!==this._hass.states[c]?.state||e.states[c]?.last_changed!==this._hass.states[c]?.last_changed),s=this._hass;this._hass=e;let a=e.states[`select.${this.robotName}_cleaning_passes`];a&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=de[a.state]??"Auto");let l=`binary_sensor.${this.robotName}_mission_active`,i=e.states[l]?.state??"";if(i)this.prevMissionActive==="on"&&i==="off"&&this.loadHistory(),this.prevMissionActive=i;else{let c=e.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&c==="docked"&&this.loadHistory(),this.prevVacuumState=c}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new j(e,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(e),(!s||n)&&this.render()}relevantEntityIds(){let e=this.robotName;return[this.config.entity,`sensor.${e}_last_error_code`,`sensor.${e}_mission_phase`,`binary_sensor.${e}_mission_active`,`binary_sensor.${e}_maintenance_due`,`binary_sensor.${e}_schedule_hold_active`,`sensor.${e}_next_clean`,`sensor.${e}_filter_remaining_hours`,`sensor.${e}_brush_remaining_hours`,`sensor.${e}_mop_tank_level`,`sensor.${e}_clean_base_status`,`sensor.${e}_nav_quality`,`sensor.${e}_next_likely_clean_window`,`sensor.${e}_presence_clean_opportunities_7d`,`sensor.${e}_presence_clean_utilisation_7d`,`sensor.${e}_cleaning_passes`,`select.${e}_cleaning_passes`,`select.${e}_smart_zone_select`,`select.${e}_zone_select`,`sensor.${e}_clean_streak`,`sensor.${e}_completion_rate_30d`,`sensor.${e}_lifetime_missions`,`sensor.${e}_lifetime_area`,`sensor.${e}_lifetime_time`]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)})}switchRobot(e){e!==this.activeRobot&&(this.activeRobot=e,this.robotName=e.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new j(this._hass,this.config,e),this.loadHistory()),this.render())}async loadHistory(){if(!(!this.apiClient||this.historyLoading)){this.historyLoading=!0,this.historyError=null,this.render();try{let e=this.config.history_days??28,o=await this.apiClient.fetchSummary(e),n=await this.apiClient.fetchRecords(e);if(n.length>0){let s=new Map;for(let a of n){let l=a.started_at.slice(0,10);s.has(l)||s.set(l,[]),s.get(l).push(a)}for(let a of o){let l=s.get(a.date);l&&(a.missions=l.sort((i,c)=>i.started_at.localeCompare(c.started_at)))}}this.missionData=o}catch(e){let o=e.message;this.historyError=o==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{this.historyLoading=!1,this.render()}}}render(){if(!this.config||!this._hass)return;let e=J(this._hass,this.robotName),o=this._hass.config?.unit_system?.length==="m",n=new Date,s=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`,l=(this.missionData?.find(d=>d.date===s)??null)?.total??null,i=ve(this._hass,this.config,e,this.robotName),c=i;i?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=i):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),c=this.lastAlertHtml);let p=`
      <style>${Se}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${le({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:l,missionData:this.missionData})}
        ${ue({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen})}
        ${fe(this._hass,this.config,e,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown})}
        ${ye(this._hass,this.config,e,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
        ${c}
        ${we(this._hass,this.config,e,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded},o)}
      </div>
    `;this.root.innerHTML=p,this.attachEventListeners()}renderRobotSelectorBar(){let e=this.entityList();return e.length<2?"":`<div class="rpc-robot-selector"><select class="rpc-robot-select" data-robot-select>${e.map(n=>{let s=this._hass.states[n]?.attributes?.friendly_name??n,a=n===this.activeRobot?" selected":"";return`<option value="${n}"${a}>${s}</option>`}).join("")}</select></div>`}attachEventListeners(){let e=this.root.querySelector(".rpc-card"),o=e.querySelector("[data-robot-select]");o&&o.addEventListener("change",s=>{s.stopPropagation(),this.switchRobot(s.target.value)}),e.querySelectorAll("[data-action]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation(),this.handleAction(s.dataset.action)})}),e.querySelectorAll("[data-room]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation();let l=s.dataset.room;this.selectedRooms.has(l)?this.selectedRooms.delete(l):this.selectedRooms.add(l),this.render()})}),e.querySelectorAll("[data-pass]").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();let l=s.dataset.pass,i=s.dataset.passOption;this.passes=l,this.render();let c=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[c]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:c,option:i})}catch{}finally{this.passSettingInFlight=!1}}})}),e.querySelectorAll("[data-bar]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation();let l=s.dataset.bar;this.openPopover=this.openPopover===l?null:l,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)})}),e.querySelectorAll("[data-close]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation(),this.openPopover=null,this.render()})}),e.querySelectorAll("[data-reset]").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();let l=s.dataset.reset,i=s.dataset.service;this.resetting=l,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",i,{entity_id:this.config.entity}),await new Promise(c=>setTimeout(c,800)),this.openPopover=null}catch{this.resetError=l}finally{this.resetting=null,this.render()}})}),e.querySelectorAll("[data-hold-action]").forEach(s=>{s.addEventListener("click",async a=>{if(a.stopPropagation(),s.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let l=`switch.${this.robotName}_schedule_hold`,i=this._hass.states[l]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",i?"turn_off":"turn_on",{entity_id:l})}finally{this.holdToggling=!1,this.render()}}})});let n=e.querySelector("[data-heatmap]");n&&n.addEventListener("click",s=>{s.stopPropagation();let a=s.target.closest("[data-date]");if(!a)return;let l=a.getAttribute("data-date");this.openDay===l?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=l,this.openDaySummary=this.missionData?.find(i=>i.date===l)??null,this.dayMissions=this.buildDayMissions(l)),this.render()}),e.querySelectorAll("[data-close-day]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),e.querySelectorAll("[data-settings-toggle]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),e.querySelectorAll("[data-switch-entity]").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();let l=s.dataset.switchEntity,i=this._hass.states[l]?.state==="on";try{await this._hass.callService("switch",i?"turn_off":"turn_on",{entity_id:l})}catch{}})}),e.querySelectorAll("[data-cycle-entity]").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();let l=s.dataset.cycleEntity,i=JSON.parse(s.dataset.cycleOptions??"[]"),c=s.dataset.cycleCurrent??"",p=i.indexOf(c),d=i.length>0?i[(p+1)%i.length]:null;if(d)try{await this._hass.callService("select","select_option",{entity_id:l,option:d})}catch{}})}),e.querySelectorAll("[data-lifetime-toggle]").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})})}buildDayMissions(e){let o=this.missionData?.find(n=>n.date===e);return!o||o.total===0?[]:o.missions&&o.missions.length>0?o.missions:[]}async handleAction(e){let{entity:o}=this.config,n=this.robotName;if(e==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let c=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${n}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:Q[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:o,room_name:c,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(e==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${n}_repeat_mission`})}catch{}return}let a={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"]}[e];if(!a)return;let[l,i]=a;if(this.loadingAction=e,this.render(),e==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(l,i,{entity_id:o})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(l,i,{entity_id:o})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let e=J(this._hass,this.robotName),o=4;return e.hasZones&&this.config.show_rooms!==!1&&(o+=3),this.config.show_health!==!1&&(o+=2),this.config.show_schedule!==!1&&(o+=2),this.config.show_history!==!1&&(o+=4),o}static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",selector:{boolean:{}}},{name:"show_health",selector:{boolean:{}}},{name:"show_schedule",selector:{boolean:{}}},{name:"show_alerts",selector:{boolean:{}}},{name:"show_history",selector:{boolean:{}}},{name:"show_lifetime",selector:{boolean:{}}},{name:"show_dirt_events",selector:{boolean:{}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",ee);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
