function re(t,n,e,o,s){let r=d=>!!t.states[`sensor.${n}_${d}`],a=d=>!!t.states[`select.${n}_${d}`],i=d=>!!t.states[`binary_sensor.${n}_${d}`],l=d=>!!t.states[`image.${n}_${d}`],c=r("mop_pad"),p=r("brush_remaining_hours");return{hasArea:r("area_cleaned_today"),hasBrush:p,hasPad:c,hasWater:r("mop_tank_level"),hasCleanBase:r("clean_base_status"),hasZones:a("smart_zone_select")||a("zone_select"),hasSmartZones:a("smart_zone_select"),hasProblemZone:r("problem_zone"),hasLifetimeArea:r("lifetime_area"),hasWearRate:r("filter_wear_rate"),isMop:c&&!p,hasMissionActive:i("mission_active"),hasMissionPhase:r("mission_phase"),hasDemandBlocked:i("demand_clean_blocked"),hasEnergyConsumption:r("total_energy_consumed"),hasCleaningSpeedTrend:r("cleaning_speed_trend"),hasBatteryRetention:r("battery_capacity_retention"),hasWifiFloor:r("recent_wifi_floor"),hasCoveragePct:r("recent_coverage_pct"),hasBatteryEol:r("estimated_battery_eol"),hasConsecutiveSkips:i("consecutive_clean_skips"),hasMopBehavior:r("mop_behavior"),hasCoverageImage:l("coverage_map"),hasWifiSignal:o?.wifi_signal!=null,hasRoomCoverage:o!=null&&"room_coverage"in o,hasDirtDensity:s!=null&&"dirt_density"in s,hasRobotSelectorHelper:!!e.robot_selector_helper&&!!t.states[e.robot_selector_helper]}}var G=class{constructor(n,e,o){this.hass=n;this.entryId=null;this.entityId=o??e.entity}updateHass(n){this.hass=n}async fetchSummary(n){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${n}`,s=await this.hass.fetchWithAuth(o);if(!s.ok)throw new Error(`${s.status}`);return s.json()}async fetchRecords(n){let o=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${n}`,s=await this.hass.fetchWithAuth(o);return s.ok?s.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let n=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=n.config_entry_id,this.entryId}};function v(t){return String(t??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function Y(t,n="en"){let e=Date.now()-new Date(t).getTime(),o=Math.floor(e/6e4);try{let s=new Intl.RelativeTimeFormat(n,{numeric:"auto"});if(o<1)return s.format(0,"minute");if(o<60)return s.format(-o,"minute");let r=Math.floor(o/60);if(r<24)return s.format(-r,"hour");let a=Math.floor(r/24);return a<30?s.format(-a,"day"):s.format(-Math.floor(a/30),"month")}catch{if(o<1)return"just now";if(o<60)return`${o}m ago`;let s=Math.floor(o/60);return s<24?`${s}h ago`:`${Math.floor(s/24)}d ago`}}var ge={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},fe="\u{1F4CD}";var se={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},ve={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function ae(t,n,e,o,s=!1){if(n.show_settings===!1)return"";let r=e,a=t.states[`switch.${r}_edge_clean`],i=t.states[`switch.${r}_always_finish`],l=t.states[`select.${r}_carpet_boost_mode`];if(!a&&!i&&!l)return"";let c="";if(o){let h=a?.state==="on",g=i?.state==="on",m=l?l.attributes.options??[]:[];c=`
      <div class="rpc-settings-panel">
        ${a?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${h?" rpc-setting-on":""}"
                    data-switch-entity="switch.${r}_edge_clean"
                    aria-pressed="${h}">
              ${h?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${g?" rpc-setting-on":""}"
                    data-switch-entity="switch.${r}_always_finish"
                    aria-pressed="${g}">
              ${g?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${l?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${r}_carpet_boost_mode"
                    data-cycle-options="${v(JSON.stringify(m))}"
                    data-cycle-current="${v(l.state)}">
              ${v(l.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${s?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${s?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${o}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${o?"\u25B2":"\u25BC"}</span>
    </button>
    ${c}
  `}function be(t){let{hass:n,config:e,caps:o,robotName:s,selectedRooms:r,passes:a,isSending:i,sendError:l,settingsPanelOpen:c}=t;if(!o.hasZones||e.show_rooms===!1)return"";let p=s,d=n.states[`select.${p}_smart_zone_select`],h=n.states[`select.${p}_zone_select`],g=d??h;if(!g)return"";let m=g.attributes.options??[];if(m.length===0)return"";let u=n.states[`button.${p}_repeat_mission`],b=!!u&&u.state!=="unavailable",C=n.states[`select.${p}_cleaning_passes`],S=o.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",f=r.size,_='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',x=(()=>{let y=o.hasSmartZones?`select.${s}_smart_zone_select`:`select.${s}_zone_select`,E=n.states[y]?.attributes?.region_icons;return E&&typeof E=="object"&&!Array.isArray(E)?E:{}})(),$=m.map(y=>{let E=r.has(y),q=x[y],V=q?ge[q]??fe:"",j=V?`${V} ${v(y)}`:v(y);return`<button class="rpc-room-chip${E?" rpc-room-chip--selected":""}"
      data-room="${v(y)}" aria-pressed="${E}">${j}</button>`}).join(""),T="";if(C){let y=a;T=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(E=>`<button class="rpc-pass-chip${y===E?" rpc-pass-chip--selected":""}"
            data-pass="${E}"
            data-pass-option="${v(se[E]??E)}">${E}</button>`).join("")}
      </div>
    `}let z=ae(n,e,s,c);return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${$}
        ${f>0?`<span class="rpc-selected-count">${f} selected</span>`:""}
      </div>
      ${T}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${f===0||i?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${f===0||i?"disabled":""}
                aria-label="${S}">
          ${i?_+" Sending\u2026":S}
        </button>
        ${b?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${l?`<div class="rpc-send-error">${v(l)}</div>`:""}
      ${z}
    </div>
  `}function Z(t,n){return t.states[n]?.state??"unavailable"}function ye(t,n,e){return n==="m2"||n==="auto"&&e?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function Oe(t,n){if(!t)return null;for(let e=t.length-1;e>=0;e--){let o=t[e];if(o.missions&&o.missions.length>0)for(let s=o.missions.length-1;s>=0;s--){let r=o.missions[s];if(r.result==="completed")return Y(r.started_at,n)}else if(o.completed>0)return Y(o.date+"T12:00:00Z",n)}return null}function Fe(t){let n=["th","st","nd","rd"],e=t%100;return t+(n[(e-20)%10]??n[e]??n[0])}function _e(t){let{hass:n,config:e,caps:o,robotName:s,loadingAction:r,todayMissionCount:a,settingsPanelOpen:i}=t,l=e.entity,c=Z(n,l),p=n.states[l]?.attributes??{},d=n.config?.unit_system?.length==="m",h=e.area_unit??"auto",g=c==="unavailable",m=r!==null,u=s,b=`sensor.${u}_last_error_code`,C=`sensor.${u}_last_error_zone`,k=`sensor.${u}_mission_recharge_time`,S=`sensor.${u}_missions_last_30d`,f=`sensor.${u}_average_area_30d`,_=`sensor.${u}_area_cleaned_today`,x=p.mission_elapsed_min??null,$=p.mission_area_sqft??null,T=parseFloat(Z(n,S)),z=isNaN(T)||T<=0?45:T,y=parseFloat(Z(n,f)),E=o.isMop,q=E?"\u{1F9F9}":"\u{1F916}",V=v(p.friendly_name??l),j=n.states[`sensor.${u}_mission_phase`]?.state??"",Q=(n.states[`binary_sensor.${u}_mission_active`]?.state??"")==="on",J=o.hasMissionActive,P=n.states[`sensor.${u}_mission_expire_time`]?.state??"",B=P&&P!=="unavailable"&&P!=="unknown"?new Date(P):null,O=!!B&&!isNaN(B.getTime())&&B>new Date,U=O?Math.max(1,Math.round((B.getTime()-Date.now())/6e4)):null,L=!1;if(J)L=c==="docked"&&Q;else{let w=Z(n,k);L=c==="docked"&&(w!=="unavailable"&&w!=="unknown"&&P!=="unavailable"&&P!=="unknown")&&O}let N="",M="",te="";if(j==="evac")N="\u2B06",M="Emptying bin";else if(L)N="\u26A1",M=U!==null?`Recharging \u2014 resuming in ~${U} min`:"Recharging \u2014 mission continues";else switch(c){case"cleaning":N="\u25CF",M=E?"Mopping":"Cleaning";break;case"paused":N="\u23F8",M="Paused";break;case"returning":N="\u21A9",M="Returning to dock";break;case"docked":N="\u2713",M="Docked";break;case"idle":N="\u25CB",M="Idle";break;case"error":N="\u26A0",M="Error",te="rpc-error-state";break;case"unavailable":N="\u2014",M="Unavailable";break}let pe="";if(c==="error"){let w=n.states[b];if(w&&w.state!=="0"&&w.state!==""&&w.state!=="unavailable"){let R=v(w.attributes.description??"Unknown error"),A=v(w.attributes.action??""),H=Z(n,C),ee=H&&H!=="unknown"&&H!=="unavailable";M=`Error ${v(w.state)} \u2014 ${R}`,pe=`
        ${A?`<div class="rpc-error-action">${A}</div>`:""}
        ${ee?`<div class="rpc-error-zone">Zone: ${v(H)}</div>`:""}
      `}else M="Robot error \u2014 check the iRobot app"}let de="";if((J?Q:c==="cleaning"||L)&&o.hasArea){let w=parseFloat(Z(n,_));if(!isNaN(w)&&w>0){let R=ye(w,h,d),A=a!==null?a+1:null,H=A!==null&&A>1?` \xB7 ${v(Fe(A))} mission`:"";de=`<div class="rpc-area-today">${R} already today${H}</div>`}}let ue="";c==="cleaning"&&x!==null&&(ue=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(x/z*100,95)}%"></div></div>`);let me="";if(c==="cleaning"){let w=[];if(x!==null){let R=Math.max(0,Math.round(z-x));w.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${R} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(o.hasArea&&$!==null&&(w.push(`<div class="rpc-metric"><span class="rpc-metric-val">${ye($,h,d)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`),!isNaN(y)&&y>0)){let R=parseFloat(Z(n,`sensor.${u}_mission_count_30d`));if(!isNaN(R)&&R>=5){let A=Math.round(($-y)/y*100),H=A>=0?"\u25B2":"\u25BC",ee=A>=0?"rpc-delta-up":"rpc-delta-down";w.push(`<div class="rpc-metric"><span class="rpc-metric-val ${ee}">${H} ${Math.abs(A)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}w.length&&(me=`<div class="rpc-metrics-row">${w.join("")}</div>`)}let X="";if(c==="docked"&&!L){let w=Oe(t.missionData,n.language);if(w)X=`<div class="rpc-docked-since">Last cleaned: ${w}</div>`;else{let R=n.states[l]?.last_changed;R&&(X=`<div class="rpc-docked-since">Last mission: ${Y(R,n.language)}</div>`)}if(o.hasDemandBlocked){let R=`binary_sensor.${s}_demand_clean_blocked`;n.states[R]?.state==="on"&&(X+='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>')}}let Ie='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',F=(w,R,A)=>{let H=r===w;return`<button class="rpc-btn${H?" rpc-btn-loading":""}"
      data-action="${w}"
      ${g||m?"disabled":""}
      aria-label="${R}">
      ${H?Ie:A}
    </button>`},W="";c==="cleaning"||j==="evac"?W=F("pause","Pause","\u23F8 Pause")+F("return_home","Return home","\u21A9 Return home"):c==="paused"?W=F("resume","Resume","\u25B6 Resume")+F("return_home","Return home","\u21A9 Return home"):L?W=F("return_home","Cancel mission","\u2715 Cancel mission"):c!=="returning"&&!g&&(W=F("start","Start","\u25B6 Start")+F("locate","Locate","\u2299 Locate"));let he=e.show_rooms!==!1;if(!he){let w=n.states[`button.${s}_repeat_mission`];!!w&&w.state!=="unavailable"&&(W+='<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>')}let Be=he?"":ae(n,e,s,i,!0);return`
    <div class="rpc-zone rpc-zone1${te?" "+te:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${q}</span>
        <span class="rpc-robot-name">${V}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${c}">${N}</span>
        <span class="rpc-state-label">${M}</span>
      </div>
      ${de}
      ${pe}
      ${ue}
      ${me}
      ${X}
      ${W?`<div class="rpc-actions">${W}</div>`:""}
      ${Be}
    </div>
  `}function xe(t,n){return Math.min(100,Math.max(0,Math.round(t/n*100)))}function $e(t,n){return n==="battery"?t>20?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)":n==="tank"?t>40?"var(--rpc-green)":t>20?"var(--rpc-amber)":"var(--rpc-red)":t>50?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)"}function We(t,n){let e=n/90;if(!e)return"";let o=t/e;return o>1.2?"\u2191":o<.8?"\u2193":"\u2192"}function we(t){let n=parseInt(t,10);return!isNaN(n)&&n>=0?`~${n} use${n!==1?"s":""} remaining`:t==="Empty"?"Bag full \u2014 replace soon":t==="Full"?"Bag has capacity":v(t)}function ke(t,n,e,o,s){if(n.show_health===!1)return"";let r=o,a=[];t.states[`sensor.${r}_filter_remaining_hours`]&&a.push({key:"filter",label:"Filter",sensorId:`sensor.${r}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${r}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${r}_filter_last_replaced`}),e.hasBrush&&t.states[`sensor.${r}_brush_remaining_hours`]&&a.push({key:"brush",label:"Brush",sensorId:`sensor.${r}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${r}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${r}_brush_last_replaced`}),e.hasPad&&t.states[`sensor.${r}_mop_pad_remaining_hours`]&&a.push({key:"pad",label:"Pad",sensorId:`sensor.${r}_mop_pad_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${r}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${r}_pad_last_replaced`}),e.hasWater&&t.states[`sensor.${r}_mop_tank_level`]&&a.push({key:"tank",label:"Tank",sensorId:`sensor.${r}_mop_tank_level`,thresholdAttr:null,type:"tank"});let i=t.states[`sensor.${r}_battery_level`]?`sensor.${r}_battery_level`:t.states[`sensor.${r}_battery`]?`sensor.${r}_battery`:null,l=i?void 0:t.states[`vacuum.${r}`]?.attributes?.battery_level;if((i||l!==void 0)&&a.push({key:"battery",label:"Battery",sensorId:i??"",thresholdAttr:null,type:"battery",rawPct:l}),e.hasCleanBase&&t.states[`sensor.${r}_clean_base_status`]&&a.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${r}_clean_base_status`,thresholdAttr:null,type:"cleanbase"}),a.length===0)return"";let c=a.map(m=>Ze(m,t,r,s)).join(""),p="";if(e.hasBatteryRetention){let m=t.states[`sensor.${r}_battery_capacity_retention`];if(m&&m.state!=="unavailable"&&m.state!=="unknown"){let u=Math.round(parseFloat(m.state));if(!isNaN(u)){let b=u>85?"var(--rpc-green)":u>70?"var(--rpc-amber)":"var(--rpc-red)",C=t.states[`sensor.${r}_charge_cycles`],k=C?parseInt(C.state,10):NaN,S=isNaN(k)?"":`${k} charge cycle${k!==1?"s":""}`,f="";if(e.hasBatteryEol){let $=t.states[`sensor.${r}_estimated_battery_eol`];if($&&$.state!=="unavailable"&&$.state!=="unknown"){let T=parseInt($.state,10);isNaN(T)||(f=T>0?`<div class="rpc-retention-eol">Battery life: ~${T} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let _=s.openPopover==="retention",x=_?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${u}% of original capacity</div>
              ${S?`<div class="rpc-popover-sub">${S}</div>`:""}
              ${f}
            </div>
          </div>`:"";p=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${_}" tabindex="0"
               aria-label="Bat. Health \u2014 ${u}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${u}%;background:${b}"></span></span>
            <span class="rpc-bar-pct" style="color:${b}">${u}%</span>
          </div>
          ${x}`}}}let d="";if(e.hasCoveragePct){let m=t.states[`sensor.${r}_recent_coverage_pct`];if(m&&m.state!=="unavailable"&&m.state!=="unknown"){let u=t.states[`sensor.${r}_missions_last_30d`],b=u?parseInt(u.state,10):NaN;if(isNaN(b)||b<10)d=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let C=Math.min(100,Math.round(parseFloat(m.state)));if(!isNaN(C)){let k=C>=85?"var(--rpc-green)":C>=65?"var(--rpc-amber)":"var(--rpc-red)",S=s.openPopover==="coverage",f=isNaN(b)?"":`Based on ${b} mission${b!==1?"s":""} in the last 30 days.`,_=S?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${C}% of floor area covered on the last mission.</div>
                ${f?`<div class="rpc-popover-sub">${f}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";d=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${S}" tabindex="0"
                 aria-label="Coverage ${C}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${C}%;background:${k}"></span></span>
              <span class="rpc-bar-pct" style="color:${k}">${C}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${_}`}}}}let h=p||d?`<div class="rpc-health-battery-sep"></div>${p}${d}`:"",g="";if(e.isMop){let m=t.states[`sensor.${r}_mop_pad`],u=e.hasMopBehavior?t.states[`sensor.${r}_mop_behavior`]:null,b=[];m&&m.state!=="unknown"&&m.state!=="unavailable"&&b.push(v(m.state)),u&&u.state!=="unknown"&&u.state!=="unavailable"&&b.push(`${v(u.state)} intensity`),b.length&&(g=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${b.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${c}
      ${h}
      ${g}
    </div>
  `}function Ze(t,n,e,o){let s=o.openPopover===t.key;if(t.type==="cleanbase"){let h=n.states[t.sensorId];return h?`
      <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${s}" tabindex="0"
           aria-label="${t.label}">
        <span class="rpc-bar-label">${t.label}</span>
        <span class="rpc-bar-cleanbase-state">${we(h.state)}</span>
      </div>
      ${s?Ve(t.label,h.state):""}
    `:""}let r=0,a="",i="",l=null;if(t.rawPct!==void 0)r=Math.min(100,Math.max(0,t.rawPct)),a=`${Math.round(r)}%`;else{let h=n.states[t.sensorId];if(!h)return"";let g=parseFloat(h.state);if(isNaN(g))return"";if(t.type==="tank"||t.type==="battery")r=Math.min(100,Math.max(0,g)),a=`${Math.round(r)}%`;else{if(l=t.thresholdAttr?h.attributes[t.thresholdAttr]:null,!l)return"";r=xe(g,l),a=`${r}%`,i=`${Math.round(g)}h`}}let c=$e(r,t.type),p="";if(t.wearSensorId&&l){let h=n.states[t.wearSensorId];h&&h.state!=="unknown"&&h.state!=="unavailable"&&(p=We(parseFloat(h.state),l))}let d=t.rawPct!==void 0?{state:String(Math.round(t.rawPct)),attributes:{}}:n.states[t.sensorId];return`
    <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${s}" tabindex="0"
         aria-label="${t.label} \u2014 ${a}">
      <span class="rpc-bar-label">${t.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${r}%;background:${c}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${c}">${a}</span>
      ${i?`<span class="rpc-bar-hours">${i}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${c}">${p}</span>`:""}
    </div>
    ${s&&d?qe(t,d,l,n,o):""}
  `}function qe(t,n,e,o,s){let r=parseFloat(n.state),a=e?xe(r,e):Math.min(100,Math.max(0,r)),i=$e(a,t.type),l=s.resetting===t.key,c=t.lastReplacedId?o.states[t.lastReplacedId]:null,p="";c&&c.state!=="unavailable"&&c.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(c.state).toLocaleDateString(o.language)} (${Y(c.state,o.language)})</span>
      </div>`);let d="";if(t.wearSensorId&&!s.legendShown){let g=o.states[t.wearSensorId];g&&g.state!=="unknown"&&g.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${v(t.label)}</span>
        <button class="rpc-popover-close" data-close="${t.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${e?`<div class="rpc-popover-row"><span>Threshold</span><span>${e} h</span></div>`:""}
      ${e?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(r)} h (${a}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${a}%;background:${i}"></div>
      </div>
      ${d}
      ${t.resetService?`
        <button class="rpc-btn rpc-btn-secondary${l?" rpc-btn-loading":""}"
                data-reset="${t.key}" data-service="${t.resetService}"
                ${l?"disabled":""}>
          ${l?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${s.resetError===t.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function Ve(t,n){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${v(t)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${we(n)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function je(t,n){if(!t||t==="unavailable"||t==="unknown")return"No schedule set";try{let e=new Date(t);return e.toLocaleDateString(n,{weekday:"short"})+" "+e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return v(t)}}function Ue(t,n){if(!t||t==="unavailable"||t==="unknown")return"";try{let e=new Date(t);if(isNaN(e.getTime()))return"";let o=e.toLocaleDateString(n,{weekday:"short"}),s=e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${o} ~${s}`}catch{return""}}function Se(t,n,e,o,s){if(n.show_schedule===!1)return"";let r=o,a=t.states[`sensor.${r}_next_clean`],i=t.states[`binary_sensor.${r}_schedule_hold_active`],l=t.states[`sensor.${r}_presence_clean_opportunities_7d`],c=t.states[`sensor.${r}_presence_clean_utilisation_7d`],p=t.states[`sensor.${r}_next_likely_clean_window`],d=!!l&&!!c&&l.state!=="unknown"&&l.state!=="unavailable"&&c.state!=="unknown"&&c.state!=="unavailable",h=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!a&&!i&&!d&&!h)return"";let g="";if(i){let k=i.state==="on",f=i.attributes.source==="presence_manager",_="rpc-badge-green",x="Schedule active",$="";k&&(f?(_="rpc-badge-blue",x="Away hold",$="\u{1F3C3}"):(_="rpc-badge-amber",x="Hold active",$="\u{1F512}")),g=`
      <button class="rpc-hold-badge ${_}"
              data-hold-action="${f?"tooltip":"toggle"}"
              aria-label="${v(x)}">
        ${s.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${$} ${x}`}
      </button>
      ${s.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let m="";if(h){let k=Ue(p.state,t.language);k&&(m=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${k}</span>
        </div>
      `)}let u="",b=n.presence_entities??[];if(b.length>0){let k=b.map(S=>{let f=t.states[S];if(!f)return"";let _=f.state==="home",x=f.attributes.friendly_name??S,$=v(x.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${_?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${$}
        <span class="rpc-presence-label">${_?"home":"away"}</span>
      </span>`}).join("");k&&(u=`<div class="rpc-presence-row">${k}</div>`)}let C="";if(d){let k=parseInt(l.state,10),S=parseInt(c.state,10);if(!isNaN(k)&&!isNaN(S)){let f=c.attributes.cleans_7d,_=f??Math.round(k*S/100),x=`${k} opportunit${k!==1?"ies":"y"} this week`;C=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${_} clean${_!==1?"s":""}`} \xB7 ${x}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${a?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${je(a.state,t.language)}</span>
            </div>`:""}
          ${m}
        </div>
        ${g}
      </div>
      ${u}
      ${C}
    </div>
  `}var Ce={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},D=16,ne=2,K=18,oe=16,I=D+ne;function Ee(t=7){return K+t*I-ne}function Re(t){return oe+t*I-ne+4}function Ye(t,n){return t.toLocaleDateString(n,{month:"short",day:"numeric"})}function Te(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Me(t,n,e,o="en-US"){let s=new Map;for(let m of t)s.set(m.date,m);let r=new Date,a=new Date(r);a.setDate(r.getDate()-(n-1));let i=(a.getDay()+6)%7;a.setDate(a.getDate()-i);let l=Math.ceil((n+i)/7),c=[];for(let m=0;m<l;m++)for(let u=0;u<7;u++){let b=new Date(a);b.setDate(a.getDate()+m*7+u),!(b>r)&&c.push({date:b,summary:s.get(Te(b))??null,col:u,row:m})}let p=Ee(),d=Re(l),h=["Mo","Tu","We","Th","Fr","Sa","Su"],g=`<svg width="${p}" height="${d}" viewBox="0 0 ${p} ${d}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let m=0;m<7;m++){let u=K+m*I+D/2;g+=`<text x="${u}" y="11" text-anchor="middle" font-size="8" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${h[m]}</text>`}for(let m of c){let u=K+m.col*I,b=oe+m.row*I,C=m.summary?.result??"none",k=Ce[C]??Ce.none,S=m.summary?.total??0,f=Ye(m.date,o);if(S===0?f+=": no missions":S===1?f+=`: 1 mission, ${C}`:f+=`: ${S} missions, ${C}`,g+=`<g role="gridcell" aria-label="${f}" data-date="${Te(m.date)}" data-result="${C}" data-total="${S}" style="cursor:pointer">`,g+=`<rect x="${u-1}" y="${b-1}" width="${D+2}" height="${D+2}" fill="transparent" rx="3"/>`,g+=`<rect x="${u}" y="${b}" width="${D}" height="${D}" fill="${k}" rx="3"/>`,S>1){let _=Math.min(S,3);for(let x=0;x<_;x++){let $=u+D-3-x*4,T=b+D-2.5;g+=`<circle cx="${$}" cy="${T}" r="1.5" fill="rgba(255,255,255,0.75)"/>`}}g+="</g>"}return g+="</svg>",g}function Ae(t){return!t||t.length===0?[]:t.every(e=>e<=4)?t.map(e=>e*25):t}function ze(t){return t<=4?t*25:t}function He(t,n){if(!t||t.length===0)return"";let e=7,o=t.length<=e?[...t]:Array.from({length:e},(h,g)=>t[Math.round(g/(e-1)*(t.length-1))]),s=Math.max(...o,1),r=o.length,a=6,i=2,l=r*a+(r-1)*i,c=16,p=n>=60?"var(--rpc-green)":n>=40?"var(--rpc-amber)":"var(--rpc-red)",d="";for(let h=0;h<r;h++){let g=h*(a+i),m=Math.max(2,Math.round(o[h]/s*c)),u=c-m;d+=`<rect x="${g}" y="${u}" width="${a}" height="${m}" fill="${p}" rx="1"/>`}return`<svg width="${l}" height="${c}" viewBox="0 0 ${l} ${c}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`}function De(t=4){let n=Ee(),e=Re(t),o=["Mo","Tu","We","Th","Fr","Sa","Su"],s=`<svg width="${n}" height="${e}" viewBox="0 0 ${n} ${e}" xmlns="http://www.w3.org/2000/svg">`;s+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let r=0;r<7;r++){let a=K+r*I+D/2;s+=`<text x="${a}" y="11" text-anchor="middle" font-size="8" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${o[r]}</text>`}for(let r=0;r<t;r++)for(let a=0;a<7;a++){let i=K+a*I,l=oe+r*I;s+=`<rect x="${i}" y="${l}" width="${D}" height="${D}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(r*7+a)*30}ms"/>`}return s+="</svg>",s}function Ne(t,n,e,o){if(n.show_alerts===!1)return"";let s=o,r=[],a=t.states[`sensor.${s}_last_error_code`];if(a&&a.state!=="0"&&a.state!==""&&a.state!=="unknown"&&a.state!=="unavailable"){let p=v(a.attributes.label??`Error ${a.state}`),d=v(a.attributes.description??""),h=v(a.attributes.action??""),g=[d,h].filter(Boolean).join(" ")||void 0;r.push({priority:1,text:`Error: ${p}`,subtext:g})}let i=t.states[`binary_sensor.${s}_maintenance_due`];if(i&&i.state==="on"){let p=t.states[`sensor.${s}_readiness`]?.state??"",d="Maintenance due";p==="bin_full"||p==="Bin Full"?d="Bin full \u2014 empty to continue":p&&p!=="Ready"&&p!=="unknown"&&p!=="unavailable"&&(d="Robot not ready \u2014 check the app"),r.push({priority:2,text:d})}if(e.hasWearRate){let p=t.states[`sensor.${s}_filter_wear_rate`],d=t.states[`sensor.${s}_filter_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let m=d.attributes.threshold_hours,u=parseFloat(p.state)/(m/90);u>1.5&&r.push({priority:3,text:`Filter wearing ${u.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup."})}let h=t.states[`sensor.${s}_brush_wear_rate`],g=t.states[`sensor.${s}_brush_remaining_hours`];if(h&&h.state!=="unknown"&&h.state!=="unavailable"&&g){let m=g.attributes.threshold_hours,u=parseFloat(h.state)/(m/90);u>1.5&&r.push({priority:4,text:`Brush wearing ${u.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles."})}}let l=t.states[`sensor.${s}_nav_quality`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let p=parseInt(l.state,10);!isNaN(p)&&p<60&&r.push({priority:5,text:`Navigation quality low (${p}/100)`,subtext:"Check lighting or move obstacles in the cleaning area."})}if(e.hasConsecutiveSkips){let p=t.states[`binary_sensor.${s}_consecutive_clean_skips`];if(p&&p.state==="on"){let d=p.attributes.skip_count??null,h=d!==null?`Robot blocked from cleaning ${d} consecutive time${d!==1?"s":""}`:"Robot blocked from cleaning repeatedly";r.push({priority:6,text:h,subtext:"Check blocking sensors or robot placement."})}}if(e.hasWifiFloor){let p=t.states[`sensor.${s}_recent_wifi_floor`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"){let d=parseInt(p.state,10),h=isNaN(d)?NaN:ze(d);!isNaN(h)&&h<50&&r.push({priority:7,text:`Wi-Fi signal dropped to ${h}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender."})}}if(r.length===0)return"";let c=r.sort((p,d)=>p.priority-d.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${c.text}</div>
          ${c.subtext?`<div class="rpc-alert-sub">${c.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function ie(t,n){return n?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function Pe(t,n,e,o,s,r){if(n.show_history===!1)return"";let a=o,i=n.history_days??28,l=n.area_unit??"auto",c=l==="m2"||l==="auto"&&r,p=t.states[`sensor.${a}_clean_streak`],d=t.states[`sensor.${a}_completion_rate_30d`],h=p?parseInt(p.state,10):0,g=d?parseInt(d.state,10):NaN,m="",u=[];if(h>0&&u.push(`\u{1F525} ${h}-day streak`),isNaN(g)||u.push(`${g}% completion rate`),e.hasCleaningSpeedTrend){let _=t.states[`sensor.${a}_cleaning_speed_trend`]?.state;_==="declining"?u.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):_==="improving"&&u.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}u.length&&(m=`<div class="rpc-history-summary">${u.map((f,_)=>_===0?f:`<span class="rpc-summary-sep">\xB7</span>${f}`).join("")}</div>`);let b="";s.loading&&!s.data?b=De(Math.ceil(i/7)):s.error?b=`<div class="rpc-history-error">${v(s.error)}</div>`:s.data&&(b=Me(s.data,i,l,t.language),s.data.length<i&&(b+=`<div class="rpc-history-partial">Showing ${s.data.length} of ${i} days \u2014 full history builds over time</div>`));let C="";if(e.hasProblemZone){let f=t.states[`sensor.${a}_problem_zone`],_=t.states[`sensor.${a}_stuck_count_30d`];if(f&&f.state!=="unknown"&&f.state!=="unavailable"){let x=_?parseInt(_.state,10):0;x>0&&(C=`<div class="rpc-problem-zone">\u26A0 ${v(f.state)} \u2014 stuck ${x}\xD7 in 30 days</div>`)}}let k="";if(s.openDay){let _=new Date(s.openDay+"T00:00:00").toLocaleDateString(t.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),x=s.dayMissions,$=s.openDaySummary,T="";if(x===null)T="";else if($&&$.total===0)T='<div class="rpc-day-empty">No missions this day</div>';else if(x.length>0)T=x.map(y=>{let E=y.result==="completed"?"\u2713":"\u2717",q=y.result==="completed"?"rpc-day-ok":"rpc-day-err",V=new Date(y.started_at).toLocaleTimeString(t.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),j=y.area_sqft!==null?ie(y.area_sqft,c):"\u2014",ce=y.zones?.map(O=>v(O)).join(" \xB7 ")??"",Q=n.show_dirt_events&&y.dirt_events!=null&&y.dirt_events>0?`${y.dirt_events} dirt event${y.dirt_events!==1?"s":""}`:"",J=[ce,Q].filter(Boolean).join(" \xB7 "),P=y.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",B="";if(y.wifi_signal&&y.wifi_signal.length>0){let O=Ae(y.wifi_signal),U=Math.min(...O),L=He(O,U);B=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${U}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${L}<span>${U}% min</span></div>`}return`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${q}">${E}</span>
            <span class="rpc-day-time">${V}</span>
            <span class="rpc-day-dur">${y.duration_min} min</span>
            <span class="rpc-day-area">${j}</span>
            ${P}
            ${J?`<div class="rpc-day-zones">${J}</div>`:""}
            ${B}
          </div>`}).join("");else if($&&$.total>0){let y=$.area_sqft!==null?ie($.area_sqft,c):null;T=`
        <div class="rpc-day-aggregate">
          <div>${$.total} mission${$.total>1?"s":""} \xB7 ${v($.result)}
            ${y?` \xB7 ${y} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let z=$?.total??0;k=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${v(_)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${z>0&&x&&x.length>0?`<div class="rpc-day-count">${z} mission${z>1?"s":""}</div>`:""}
        ${T}
      </div>
    `}let S="";if(n.show_lifetime!==!1){let f=t.states[`sensor.${a}_lifetime_missions`],_=t.states[`sensor.${a}_lifetime_area`],x=t.states[`sensor.${a}_lifetime_time`],$=f?parseInt(f.state,10):NaN,T=x?parseInt(x.state,10):NaN,z=_?parseFloat(_.state):NaN;if(!isNaN($)&&!isNaN(T)&&!isNaN(z)){let y=ie(z,c),E=s.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          <span>${$.toLocaleString()} missions</span>
          <span>${y}</span>
          <span>${T.toLocaleString()} h</span>
        </div>`:"";S=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${s.lifetimeExpanded}">
          Lifetime ${s.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${E}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${i} DAYS</div>
      ${m}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${b}
      </div>
      ${C}
      ${k}
      ${S}
    </div>
  `}var Le=`
  :host {
    display: block;
    font-family: inherit;
    /* Semantic colours \u2014 cascade from HA theme when available, fall back to
       accessible defaults that match the standard HA colour palette.
       --state-active-color / --warning-color / --error-color are defined by
       every HA theme including Bubble Card themes and the default theme.      */
    --rpc-green:      var(--state-active-color,   #2d9c4f);
    --rpc-amber:      var(--warning-color,         #d97706);
    --rpc-red:        var(--error-color,           #db4437);
    --rpc-blue:       var(--primary-color,         #2563eb);
    --rpc-grey-light: var(--divider-color,         #e5e7eb);
    --rpc-grey-mid:   var(--disabled-text-color,   #9ca3af);
    /* Heatmap empty-cell colour follows the card's secondary surface */
    --rpc-cell-empty: var(--secondary-background-color, #e5e7eb);
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
    box-shadow: var(--ha-card-box-shadow, none);
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

  /* F3b \u2014 compact divider + CONTROLS label when settings relocate to Status zone */
  .rpc-settings-divider--compact { margin: 8px 0 4px; }
  .rpc-controls-label { margin-top: 4px; margin-bottom: 4px; }

  /* v1.3 \u2014 static bar rows (no popover / click interaction) */
  .rpc-bar-row--static { cursor: default; }
  .rpc-bar-row--static:hover { background: transparent; }

  /* v1.3 \u2014 coverage "Building history\u2026" skeleton text */
  .rpc-coverage-building {
    flex: 1; font-size: 0.8rem; color: var(--secondary-text-color);
    font-style: italic;
  }

  /* v1.3 \u2014 battery health group separator */
  .rpc-health-battery-sep { height: 1px; background: var(--divider-color, rgba(0,0,0,.06)); margin: 4px 0; }

  /* v1.3 \u2014 retention popover body + sub-line */
  .rpc-popover-body { padding: 4px 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px; }
  .rpc-popover-sub  { font-size: 0.78rem; color: var(--secondary-text-color); }

  /* v1.3 \u2014 battery EOL lines inside retention popover */
  .rpc-retention-eol      { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-retention-eol--warn { color: var(--rpc-red); font-weight: 500; }

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
  /* F1: demand initiator badge \u2014 robot cleaned because floor was dirty */
  .rpc-initiator-badge {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--rpc-blue); background: color-mix(in srgb, var(--rpc-blue) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--rpc-blue) 25%, transparent);
    border-radius: 4px; padding: 1px 5px; vertical-align: middle; white-space: nowrap;
    flex-shrink: 0;
  }
  /* v1.3 \u2014 WiFi sparkline row in day popover */
  .rpc-day-wifi {
    width: 100%; padding-left: 20px; display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px;
  }

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
  .rpc-history-summary {
    display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px;
  }
  .rpc-summary-sep { margin: 0 5px; opacity: 0.5; }
  /* v1.3 \u2014 speed trend colour tokens in history summary bar */
  .rpc-trend-declining { color: var(--rpc-amber); font-weight: 500; }
  .rpc-trend-improving { color: var(--rpc-green); font-weight: 500; }
  .rpc-heatmap-wrap { overflow: hidden; }
  /* SVG has explicit width/height attrs \u2014 display:block prevents inline gap */
  .rpc-heatmap-wrap svg { display: block; }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }
`,le=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=e=>{if(!e.composedPath().includes(this)){let s=!1;this.openPopover!==null&&(this.openPopover=null,s=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,s=!0),s&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)})}setConfig(e){let o=e.entities&&e.entities.length>0?e.entities:[e.entity];if(!o[0])throw new Error("roomba-plus-card: entity is required");let s=this.activeRobot,r=o.includes(s)?s:o[0],a=r!==s;this.config=e,this.activeRobot=r,this.robotName=r.replace("vacuum.",""),a&&this.resetRobotState(),this.root.innerHTML=`<style>${Le}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(e){let o=this.relevantEntityIds(),s=!this._hass||o.some(c=>e.states[c]?.state!==this._hass.states[c]?.state||e.states[c]?.last_changed!==this._hass.states[c]?.last_changed),r=this._hass;this._hass=e;let a=e.states[`select.${this.robotName}_cleaning_passes`];a&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=ve[a.state]??"Auto");let i=`binary_sensor.${this.robotName}_mission_active`,l=e.states[i]?.state??"";if(l)this.prevMissionActive==="on"&&l==="off"&&this.loadHistory(),this.prevMissionActive=l;else{let c=e.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&c==="docked"&&this.loadHistory(),this.prevVacuumState=c}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new G(e,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(e),(!r||s)&&this.render()}relevantEntityIds(){let e=this.robotName;return[this.activeRobot,`sensor.${e}_last_error_code`,`sensor.${e}_last_error_zone`,`sensor.${e}_mission_phase`,`binary_sensor.${e}_mission_active`,`binary_sensor.${e}_maintenance_due`,`sensor.${e}_readiness`,`binary_sensor.${e}_schedule_hold_active`,`sensor.${e}_next_clean`,`sensor.${e}_filter_remaining_hours`,`sensor.${e}_brush_remaining_hours`,`sensor.${e}_mop_pad`,`sensor.${e}_mop_tank_level`,`sensor.${e}_mop_behavior`,`sensor.${e}_clean_base_status`,`sensor.${e}_nav_quality`,`sensor.${e}_next_likely_clean_window`,`sensor.${e}_presence_clean_opportunities_7d`,`sensor.${e}_presence_clean_utilisation_7d`,`sensor.${e}_cleaning_passes`,`select.${e}_cleaning_passes`,`select.${e}_smart_zone_select`,`select.${e}_zone_select`,`sensor.${e}_clean_streak`,`sensor.${e}_completion_rate_30d`,`sensor.${e}_lifetime_missions`,`sensor.${e}_lifetime_area`,`sensor.${e}_lifetime_time`,`sensor.${e}_battery_capacity_retention`,`sensor.${e}_estimated_battery_eol`,`sensor.${e}_recent_wifi_floor`,`sensor.${e}_recent_coverage_pct`,`sensor.${e}_missions_last_30d`,`sensor.${e}_cleaning_speed_trend`,`binary_sensor.${e}_consecutive_clean_skips`,`sensor.${e}_area_cleaned_today`,`sensor.${e}_mission_expire_time`,`sensor.${e}_average_area_30d`,`sensor.${e}_mission_count_30d`,`binary_sensor.${e}_demand_clean_blocked`,`image.${e}_coverage_map`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)})}async switchRobot(e){if(e===this.activeRobot)return;this.activeRobot=e,this.robotName=e.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new G(this._hass,this.config,e),this.loadHistory()),this.render();let o=this.config.robot_selector_helper;if(o&&this._hass.states[o]){let s=o.split(".")[0],r=s==="input_select"?"select_option":"set_value",a=s==="input_select"?{entity_id:o,option:e}:{entity_id:o,value:e};try{await this._hass.callService(s,r,a)}catch(i){console.warn("roomba-plus-card: robot_selector_helper write failed",i)}}}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let e=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let o=this.config.history_days??28,s=await this.apiClient.fetchSummary(o),r=await this.apiClient.fetchRecords(o);if(r.length>0){let a=new Map;for(let i of r){let l=i.started_at.slice(0,10);a.has(l)||a.set(l,[]),a.get(l).push(i)}for(let i of s){let l=a.get(i.date);l&&(i.missions=l.sort((c,p)=>c.started_at.localeCompare(p.started_at)))}}this.missionData=s,this.firstRecord=r.length>0?r[r.length-1]:null,this.firstSummary=s.length>0?s[s.length-1]:null}catch(o){let s=o.message;this.historyError=s==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==e)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let e=re(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),o=this._hass.config?.unit_system?.length==="m",s=new Date,r=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`,i=(this.missionData?.find(d=>d.date===r)??null)?.total??null,l=Ne(this._hass,this.config,e,this.robotName),c=l;l?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=l):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),c=this.lastAlertHtml);let p=`
      <style>${Le}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${_e({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:i,missionData:this.missionData,settingsPanelOpen:this.settingsPanelOpen})}
        ${be({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen})}
        ${ke(this._hass,this.config,e,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown})}
        ${Se(this._hass,this.config,e,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
        ${c}
        ${Pe(this._hass,this.config,e,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded},o)}
      </div>
    `;this.root.innerHTML=p,this.attachEventListeners()}renderRobotSelectorBar(){let e=this.entityList();return e.length<2?"":`<div class="rpc-robot-selector"><select class="rpc-robot-select" data-robot-select>${e.map(s=>{let r=this._hass.states[s]?.attributes?.friendly_name??s,a=s===this.activeRobot?" selected":"";return`<option value="${s}"${a}>${r}</option>`}).join("")}</select></div>`}attachEventListeners(){let e=this.root.querySelector(".rpc-card"),o=e.querySelector("[data-robot-select]");o&&o.addEventListener("change",r=>{r.stopPropagation(),this.switchRobot(r.target.value)}),e.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.handleAction(r.dataset.action)})}),e.querySelectorAll("[data-room]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation();let i=r.dataset.room;this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render()})}),e.querySelectorAll("[data-pass]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.pass,l=r.dataset.passOption;this.passes=i,this.render();let c=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[c]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:c,option:l})}catch{}finally{this.passSettingInFlight=!1}}})}),e.querySelectorAll("[data-bar]").forEach(r=>{let a=i=>{i.stopPropagation();let l=r.dataset.bar;this.openPopover=this.openPopover===l?null:l,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)};r.addEventListener("click",a),r.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),a(i))})}),e.querySelectorAll("[data-close]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.openPopover=null,this.render()})}),e.querySelectorAll("[data-reset]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.reset,l=r.dataset.service;this.resetting=i,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",l,{entity_id:this.config.entity}),await new Promise(c=>setTimeout(c,800)),this.openPopover=null}catch{this.resetError=i}finally{this.resetting=null,this.render()}})}),e.querySelectorAll("[data-hold-action]").forEach(r=>{r.addEventListener("click",async a=>{if(a.stopPropagation(),r.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let i=`switch.${this.robotName}_schedule_hold`,l=this._hass.states[i]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",l?"turn_off":"turn_on",{entity_id:i})}finally{this.holdToggling=!1,this.render()}}})});let s=e.querySelector("[data-heatmap]");s&&s.addEventListener("click",r=>{r.stopPropagation();let a=r.target.closest("[data-date]");if(!a)return;let i=a.getAttribute("data-date");this.openDay===i?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=i,this.openDaySummary=this.missionData?.find(l=>l.date===i)??null,this.dayMissions=this.buildDayMissions(i)),this.render()}),e.querySelectorAll("[data-close-day]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),e.querySelectorAll("[data-settings-toggle]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),e.querySelectorAll("[data-switch-entity]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.switchEntity,l=this._hass.states[i]?.state==="on";try{await this._hass.callService("switch",l?"turn_off":"turn_on",{entity_id:i})}catch{}})}),e.querySelectorAll("[data-cycle-entity]").forEach(r=>{r.addEventListener("click",async a=>{a.stopPropagation();let i=r.dataset.cycleEntity,l=JSON.parse(r.dataset.cycleOptions??"[]"),c=r.dataset.cycleCurrent??"",p=l.indexOf(c),d=l.length>0?l[(p+1)%l.length]:null;if(d)try{await this._hass.callService("select","select_option",{entity_id:i,option:d})}catch{}})}),e.querySelectorAll("[data-lifetime-toggle]").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})})}buildDayMissions(e){let o=this.missionData?.find(s=>s.date===e);return!o||o.total===0?[]:o.missions&&o.missions.length>0?o.missions:[]}async handleAction(e){let{entity:o}=this.config,s=this.robotName;if(e==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let c=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${s}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:se[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:o,room_name:c,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(e==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${s}_repeat_mission`})}catch{}return}let a={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"]}[e];if(!a)return;let[i,l]=a;if(this.loadingAction=e,this.render(),e==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(i,l,{entity_id:o})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(i,l,{entity_id:o})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let e=re(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),o=4;return e.hasZones&&this.config.show_rooms!==!1&&(o+=3),this.config.show_health!==!1&&(o+=2),this.config.show_schedule!==!1&&(o+=2),this.config.show_history!==!1&&(o+=4),o}static getConfigForm(){return{schema:[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",label:"Show room selector zone",selector:{boolean:{}}},{name:"show_settings",label:"Show settings panel",selector:{boolean:{}}},{name:"show_health",label:"Show health zone",selector:{boolean:{}}},{name:"show_schedule",label:"Show schedule & presence zone",selector:{boolean:{}}},{name:"show_alerts",label:"Show alerts zone",selector:{boolean:{}}},{name:"show_history",label:"Show history zone",selector:{boolean:{}}},{name:"show_lifetime",label:"Show lifetime stats",selector:{boolean:{}}},{name:"show_dirt_events",label:"Show dirt events in day detail",selector:{boolean:{}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",le);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
