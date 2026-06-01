function X(e,a,t,n,r){let s=d=>!!e.states[`sensor.${a}_${d}`],o=d=>!!e.states[`select.${a}_${d}`],l=d=>!!e.states[`binary_sensor.${a}_${d}`],i=d=>!!e.states[`image.${a}_${d}`],c=s("mop_pad"),p=s("brush_remaining_hours");return{hasArea:s("area_cleaned_today"),hasBrush:p,hasPad:c,hasWater:s("mop_tank_level"),hasCleanBase:s("clean_base_status"),hasZones:o("smart_zone_select")||o("zone_select"),hasSmartZones:o("smart_zone_select"),hasProblemZone:s("problem_zone"),hasLifetimeArea:s("lifetime_area"),hasWearRate:s("filter_wear_rate"),isMop:c&&!p,hasMissionActive:l("mission_active"),hasMissionPhase:s("mission_phase"),hasDemandBlocked:l("demand_clean_blocked"),hasEnergyConsumption:s("total_energy_consumed"),hasCleaningSpeedTrend:s("cleaning_speed_trend"),hasBatteryRetention:s("battery_capacity_retention"),hasWifiFloor:s("recent_wifi_floor"),hasCoveragePct:s("recent_coverage_pct"),hasBatteryEol:s("estimated_battery_eol"),hasConsecutiveSkips:l("consecutive_clean_skips"),hasMopBehavior:s("mop_behavior"),hasCoverageImage:i("coverage_map"),hasWifiSignal:n?.wifi_signal!=null,hasRoomCoverage:n!=null&&"room_coverage"in n,hasDirtDensity:r!=null&&"dirt_density"in r,hasRobotSelectorHelper:!!t.robot_selector_helper&&!!e.states[t.robot_selector_helper]}}var G=class{constructor(a,t,n){this.hass=a;this.entryId=null;this.entityId=n??t.entity}updateHass(a){this.hass=a}async fetchSummary(a){let n=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${a}`,r=await this.hass.fetchWithAuth(n);if(!r.ok)throw new Error(`${r.status}`);return r.json()}async fetchRecords(a){let n=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${a}`,r=await this.hass.fetchWithAuth(n);return r.ok?r.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let a=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=a.config_entry_id,this.entryId}};function x(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]??a)}function V(e,a="en"){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);try{let r=new Intl.RelativeTimeFormat(a,{numeric:"auto"});if(n<1)return r.format(0,"minute");if(n<60)return r.format(-n,"minute");let s=Math.floor(n/60);if(s<24)return r.format(-s,"hour");let o=Math.floor(s/24);return o<30?r.format(-o,"day"):r.format(-Math.floor(o/30),"month")}catch{if(n<1)return"just now";if(n<60)return`${n}m ago`;let r=Math.floor(n/60);return r<24?`${r}h ago`:`${Math.floor(r/24)}d ago`}}var pe={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},de="\u{1F4CD}";var ee={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},ue={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function te(e,a,t,n,r=!1){if(a.show_settings===!1)return"";let s=t,o=e.states[`switch.${s}_edge_clean`],l=e.states[`switch.${s}_always_finish`],i=e.states[`select.${s}_carpet_boost_mode`];if(!o&&!l&&!i)return"";let c="";if(n){let u=o?.state==="on",y=l?.state==="on",f=i?i.attributes.options??[]:[];c=`
      <div class="rpc-settings-panel">
        ${o?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${u?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_edge_clean"
                    aria-pressed="${u}">
              ${u?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${l?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${y?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_always_finish"
                    aria-pressed="${y}">
              ${y?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${s}_carpet_boost_mode"
                    data-cycle-options="${x(JSON.stringify(f))}"
                    data-cycle-current="${x(i.state)}">
              ${x(i.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${r?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${r?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${n}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${n?"\u25B2":"\u25BC"}</span>
    </button>
    ${c}
  `}function me(e){let{hass:a,config:t,caps:n,robotName:r,selectedRooms:s,passes:o,isSending:l,sendError:i,settingsPanelOpen:c}=e;if(!n.hasZones||t.show_rooms===!1)return"";let p=r,d=a.states[`select.${p}_smart_zone_select`],u=a.states[`select.${p}_zone_select`],y=d??u;if(!y)return"";let f=y.attributes.options??[];if(f.length===0)return"";let m=a.states[`button.${p}_repeat_mission`],k=!!m&&m.state!=="unavailable",T=a.states[`select.${p}_cleaning_passes`],v=n.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",h=s.size,b='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',w=(()=>{let g=n.hasSmartZones?`select.${r}_smart_zone_select`:`select.${r}_zone_select`,R=a.states[g]?.attributes?.region_icons;return R&&typeof R=="object"&&!Array.isArray(R)?R:{}})(),_=f.map(g=>{let R=s.has(g),D=w[g],I=D?pe[D]??de:"",B=I?`${I} ${x(g)}`:x(g);return`<button class="rpc-room-chip${R?" rpc-room-chip--selected":""}"
      data-room="${x(g)}" aria-pressed="${R}">${B}</button>`}).join(""),C="";if(T){let g=o;C=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(R=>`<button class="rpc-pass-chip${g===R?" rpc-pass-chip--selected":""}"
            data-pass="${R}"
            data-pass-option="${x(ee[R]??R)}">${R}</button>`).join("")}
      </div>
    `}let E=te(a,t,r,c);return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${_}
        ${h>0?`<span class="rpc-selected-count">${h} selected</span>`:""}
      </div>
      ${C}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${h===0||l?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${h===0||l?"disabled":""}
                aria-label="${v}">
          ${l?b+" Sending\u2026":v}
        </button>
        ${k?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${i?`<div class="rpc-send-error">${x(i)}</div>`:""}
      ${E}
    </div>
  `}function W(e,a){return e.states[a]?.state??"unavailable"}function he(e,a,t){return a==="m2"||a==="auto"&&t?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function He(e,a){if(!e)return null;for(let t=e.length-1;t>=0;t--){let n=e[t];if(n.missions&&n.missions.length>0)for(let r=n.missions.length-1;r>=0;r--){let s=n.missions[r];if(s.result==="completed")return V(s.started_at,a)}else if(n.completed>0)return V(n.date+"T12:00:00Z",a)}return null}function De(e){let a=["th","st","nd","rd"],t=e%100;return e+(a[(t-20)%10]??a[t]??a[0])}function ge(e){let{hass:a,config:t,caps:n,robotName:r,loadingAction:s,todayMissionCount:o,settingsPanelOpen:l}=e,i=t.entity,c=W(a,i),p=a.states[i]?.attributes??{},d=a.config?.unit_system?.length==="m",u=t.area_unit??"auto",y=c==="unavailable",f=s!==null,m=r,k=`sensor.${m}_last_error_code`,T=`sensor.${m}_last_error_zone`,$=`sensor.${m}_mission_recharge_time`,v=`sensor.${m}_missions_last_30d`,h=`sensor.${m}_average_area_30d`,b=`sensor.${m}_area_cleaned_today`,w=p.mission_elapsed_min??null,_=p.mission_area_sqft??null,C=parseFloat(W(a,v)),E=isNaN(C)||C<=0?45:C,g=parseFloat(W(a,h)),R=n.isMop,D=R?"\u{1F9F9}":"\u{1F916}",I=x(p.friendly_name??i),B=a.states[`sensor.${m}_mission_phase`]?.state??"",U=(a.states[`binary_sensor.${m}_mission_active`]?.state??"")==="on",j=n.hasMissionActive,N=a.states[`sensor.${m}_mission_expire_time`]?.state??"",L=N&&N!=="unavailable"&&N!=="unknown"?new Date(N):null,Z=!!L&&!isNaN(L.getTime())&&L>new Date,Y=Z?Math.max(1,Math.round((L.getTime()-Date.now())/6e4)):null,q=!1;if(j)q=c==="docked"&&U;else{let S=W(a,$);q=c==="docked"&&(S!=="unavailable"&&S!=="unknown"&&N!=="unavailable"&&N!=="unknown")&&Z}let P="",M="",Q="";if(B==="evac")P="\u2B06",M="Emptying bin";else if(q)P="\u26A1",M=Y!==null?`Recharging \u2014 resuming in ~${Y} min`:"Recharging \u2014 mission continues";else switch(c){case"cleaning":P="\u25CF",M=R?"Mopping":"Cleaning";break;case"paused":P="\u23F8",M="Paused";break;case"returning":P="\u21A9",M="Returning to dock";break;case"docked":P="\u2713",M="Docked";break;case"idle":P="\u25CB",M="Idle";break;case"error":P="\u26A0",M="Error",Q="rpc-error-state";break;case"unavailable":P="\u2014",M="Unavailable";break}let ne="";if(c==="error"){let S=a.states[k];if(S&&S.state!=="0"&&S.state!==""&&S.state!=="unavailable"){let z=x(S.attributes.description??"Unknown error"),A=x(S.attributes.action??""),H=W(a,T),K=H&&H!=="unknown"&&H!=="unavailable";M=`Error ${x(S.state)} \u2014 ${z}`,ne=`
        ${A?`<div class="rpc-error-action">${A}</div>`:""}
        ${K?`<div class="rpc-error-zone">Zone: ${x(H)}</div>`:""}
      `}else M="Robot error \u2014 check the iRobot app"}let oe="";if((j?U:c==="cleaning"||q)&&n.hasArea){let S=parseFloat(W(a,b));if(!isNaN(S)&&S>0){let z=he(S,u,d),A=o!==null?o+1:null,H=A!==null&&A>1?` \xB7 ${x(De(A))} mission`:"";oe=`<div class="rpc-area-today">${z} already today${H}</div>`}}let ie="";c==="cleaning"&&w!==null&&(ie=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(w/E*100,95)}%"></div></div>`);let le="";if(c==="cleaning"){let S=[];if(w!==null){let z=Math.max(0,Math.round(E-w));S.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${z} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(n.hasArea&&_!==null&&(S.push(`<div class="rpc-metric"><span class="rpc-metric-val">${he(_,u,d)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`),!isNaN(g)&&g>0)){let z=parseFloat(W(a,`sensor.${m}_mission_count_30d`));if(!isNaN(z)&&z>=5){let A=Math.round((_-g)/g*100),H=A>=0?"\u25B2":"\u25BC",K=A>=0?"rpc-delta-up":"rpc-delta-down";S.push(`<div class="rpc-metric"><span class="rpc-metric-val ${K}">${H} ${Math.abs(A)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}S.length&&(le=`<div class="rpc-metrics-row">${S.join("")}</div>`)}let J="";if(c==="docked"&&!q){let S=He(e.missionData,a.language);if(S)J=`<div class="rpc-docked-since">Last cleaned: ${S}</div>`;else{let z=a.states[i]?.last_changed;z&&(J=`<div class="rpc-docked-since">Last mission: ${V(z,a.language)}</div>`)}if(n.hasDemandBlocked){let z=`binary_sensor.${r}_demand_clean_blocked`;a.states[z]?.state==="on"&&(J+='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>')}}let Me='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',O=(S,z,A)=>{let H=s===S;return`<button class="rpc-btn${H?" rpc-btn-loading":""}"
      data-action="${S}"
      ${y||f?"disabled":""}
      aria-label="${z}">
      ${H?Me:A}
    </button>`},F="";c==="cleaning"||B==="evac"?F=O("pause","Pause","\u23F8 Pause")+O("return_home","Return home","\u21A9 Return home"):c==="paused"?F=O("resume","Resume","\u25B6 Resume")+O("return_home","Return home","\u21A9 Return home"):q?F=O("return_home","Cancel mission","\u2715 Cancel mission"):c!=="returning"&&!y&&(F=O("start","Start","\u25B6 Start")+O("locate","Locate","\u2299 Locate"));let ce=t.show_rooms!==!1;if(!ce){let S=a.states[`button.${r}_repeat_mission`];!!S&&S.state!=="unavailable"&&(F+='<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>')}let Ae=ce?"":te(a,t,r,l,!0);return`
    <div class="rpc-zone rpc-zone1${Q?" "+Q:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${D}</span>
        <span class="rpc-robot-name">${I}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${c}">${P}</span>
        <span class="rpc-state-label">${M}</span>
      </div>
      ${oe}
      ${ne}
      ${ie}
      ${le}
      ${J}
      ${F?`<div class="rpc-actions">${F}</div>`:""}
      ${Ae}
    </div>
  `}function fe(e,a){return Math.min(100,Math.max(0,Math.round(e/a*100)))}function ve(e,a){return a==="battery"?e>20?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)":a==="tank"?e>40?"var(--rpc-green)":e>20?"var(--rpc-amber)":"var(--rpc-red)":e>50?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)"}function Pe(e,a){let t=a/90;if(!t)return"";let n=e/t;return n>1.2?"\u2191":n<.8?"\u2193":"\u2192"}function be(e){let a=parseInt(e,10);return!isNaN(a)&&a>=0?`~${a} use${a!==1?"s":""} remaining`:e==="Empty"?"Bag full \u2014 replace soon":e==="Full"?"Bag has capacity":x(e)}function ye(e,a,t,n,r){if(a.show_health===!1)return"";let s=n,o=[];e.states[`sensor.${s}_filter_remaining_hours`]&&o.push({key:"filter",label:"Filter",sensorId:`sensor.${s}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${s}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${s}_filter_last_replaced`}),t.hasBrush&&e.states[`sensor.${s}_brush_remaining_hours`]&&o.push({key:"brush",label:"Brush",sensorId:`sensor.${s}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${s}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${s}_brush_last_replaced`}),t.hasPad&&e.states[`sensor.${s}_mop_pad_remaining_hours`]&&o.push({key:"pad",label:"Pad",sensorId:`sensor.${s}_mop_pad_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${s}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${s}_pad_last_replaced`}),t.hasWater&&e.states[`sensor.${s}_mop_tank_level`]&&o.push({key:"tank",label:"Tank",sensorId:`sensor.${s}_mop_tank_level`,thresholdAttr:null,type:"tank"});let l=e.states[`sensor.${s}_battery_level`]?`sensor.${s}_battery_level`:e.states[`sensor.${s}_battery`]?`sensor.${s}_battery`:null,i=l?void 0:e.states[`vacuum.${s}`]?.attributes?.battery_level;if((l||i!==void 0)&&o.push({key:"battery",label:"Battery",sensorId:l??"",thresholdAttr:null,type:"battery",rawPct:i}),t.hasCleanBase&&e.states[`sensor.${s}_clean_base_status`]&&o.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${s}_clean_base_status`,thresholdAttr:null,type:"cleanbase"}),o.length===0)return"";let c=o.map(f=>Ne(f,e,s,r)).join(""),p="";if(t.hasBatteryRetention){let f=e.states[`sensor.${s}_battery_capacity_retention`];if(f&&f.state!=="unavailable"&&f.state!=="unknown"){let m=Math.round(parseFloat(f.state));if(!isNaN(m)){let k=m>85?"var(--rpc-green)":m>70?"var(--rpc-amber)":"var(--rpc-red)",T=e.states[`sensor.${s}_charge_cycles`],$=T?parseInt(T.state,10):NaN,v=isNaN($)?"":`${$} charge cycle${$!==1?"s":""}`,h="";if(t.hasBatteryEol){let _=e.states[`sensor.${s}_estimated_battery_eol`];if(_&&_.state!=="unavailable"&&_.state!=="unknown"){let C=parseInt(_.state,10);isNaN(C)||(h=C>0?`<div class="rpc-retention-eol">Battery life: ~${C} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let b=r.openPopover==="retention",w=b?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${m}% of original capacity</div>
              ${v?`<div class="rpc-popover-sub">${v}</div>`:""}
              ${h}
            </div>
          </div>`:"";p=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${b}" tabindex="0"
               aria-label="Bat. Health \u2014 ${m}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${m}%;background:${k}"></span></span>
            <span class="rpc-bar-pct" style="color:${k}">${m}%</span>
          </div>
          ${w}`}}}let d="";if(t.hasCoveragePct){let f=e.states[`sensor.${s}_recent_coverage_pct`];if(f&&f.state!=="unavailable"&&f.state!=="unknown"){let m=e.states[`sensor.${s}_missions_last_30d`],k=m?parseInt(m.state,10):NaN;if(isNaN(k)||k<10)d=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let T=Math.min(100,Math.round(parseFloat(f.state)));if(!isNaN(T)){let $=T>=85?"var(--rpc-green)":T>=65?"var(--rpc-amber)":"var(--rpc-red)",v=r.openPopover==="coverage",h=isNaN(k)?"":`Based on ${k} mission${k!==1?"s":""} in the last 30 days.`,b=v?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${T}% of floor area covered on the last mission.</div>
                ${h?`<div class="rpc-popover-sub">${h}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";d=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${v}" tabindex="0"
                 aria-label="Coverage ${T}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${T}%;background:${$}"></span></span>
              <span class="rpc-bar-pct" style="color:${$}">${T}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${b}`}}}}let u=p||d?`<div class="rpc-health-battery-sep"></div>${p}${d}`:"",y="";if(t.isMop){let f=e.states[`sensor.${s}_mop_pad`],m=t.hasMopBehavior?e.states[`sensor.${s}_mop_behavior`]:null,k=[];f&&f.state!=="unknown"&&f.state!=="unavailable"&&k.push(x(f.state)),m&&m.state!=="unknown"&&m.state!=="unavailable"&&k.push(`${x(m.state)} intensity`),k.length&&(y=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${k.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${c}
      ${u}
      ${y}
    </div>
  `}function Ne(e,a,t,n){let r=n.openPopover===e.key;if(e.type==="cleanbase"){let u=a.states[e.sensorId];return u?`
      <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${r}" tabindex="0"
           aria-label="${e.label}">
        <span class="rpc-bar-label">${e.label}</span>
        <span class="rpc-bar-cleanbase-state">${be(u.state)}</span>
      </div>
      ${r?Ie(e.label,u.state):""}
    `:""}let s=0,o="",l="",i=null;if(e.rawPct!==void 0)s=Math.min(100,Math.max(0,e.rawPct)),o=`${Math.round(s)}%`;else{let u=a.states[e.sensorId];if(!u)return"";let y=parseFloat(u.state);if(isNaN(y))return"";if(e.type==="tank"||e.type==="battery")s=Math.min(100,Math.max(0,y)),o=`${Math.round(s)}%`;else{if(i=e.thresholdAttr?u.attributes[e.thresholdAttr]:null,!i)return"";s=fe(y,i),o=`${s}%`,l=`${Math.round(y)}h`}}let c=ve(s,e.type),p="";if(e.wearSensorId&&i){let u=a.states[e.wearSensorId];u&&u.state!=="unknown"&&u.state!=="unavailable"&&(p=Pe(parseFloat(u.state),i))}let d=e.rawPct!==void 0?{state:String(Math.round(e.rawPct)),attributes:{}}:a.states[e.sensorId];return`
    <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${r}" tabindex="0"
         aria-label="${e.label} \u2014 ${o}">
      <span class="rpc-bar-label">${e.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${s}%;background:${c}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${c}">${o}</span>
      ${l?`<span class="rpc-bar-hours">${l}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${c}">${p}</span>`:""}
    </div>
    ${r&&d?Le(e,d,i,a,n):""}
  `}function Le(e,a,t,n,r){let s=parseFloat(a.state),o=t?fe(s,t):Math.min(100,Math.max(0,s)),l=ve(o,e.type),i=r.resetting===e.key,c=e.lastReplacedId?n.states[e.lastReplacedId]:null,p="";c&&c.state!=="unavailable"&&c.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(c.state).toLocaleDateString(n.language)} (${V(c.state,n.language)})</span>
      </div>`);let d="";if(e.wearSensorId&&!r.legendShown){let y=n.states[e.wearSensorId];y&&y.state!=="unknown"&&y.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${x(e.label)}</span>
        <button class="rpc-popover-close" data-close="${e.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${t?`<div class="rpc-popover-row"><span>Threshold</span><span>${t} h</span></div>`:""}
      ${t?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(s)} h (${o}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${o}%;background:${l}"></div>
      </div>
      ${d}
      ${e.resetService?`
        <button class="rpc-btn rpc-btn-secondary${i?" rpc-btn-loading":""}"
                data-reset="${e.key}" data-service="${e.resetService}"
                ${i?"disabled":""}>
          ${i?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${r.resetError===e.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function Ie(e,a){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${x(e)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${be(a)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function Be(e,a){if(!e||e==="unavailable"||e==="unknown")return"No schedule set";try{let t=new Date(e);return t.toLocaleDateString(a,{weekday:"short"})+" "+t.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return x(e)}}function Oe(e,a){if(!e||e==="unavailable"||e==="unknown")return"";try{let t=new Date(e);if(isNaN(t.getTime()))return"";let n=t.toLocaleDateString(a,{weekday:"short"}),r=t.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${n} ~${r}`}catch{return""}}function _e(e,a,t,n,r){if(a.show_schedule===!1)return"";let s=n,o=e.states[`sensor.${s}_next_clean`],l=e.states[`binary_sensor.${s}_schedule_hold_active`],i=e.states[`sensor.${s}_presence_clean_opportunities_7d`],c=e.states[`sensor.${s}_presence_clean_utilisation_7d`],p=e.states[`sensor.${s}_next_likely_clean_window`],d=!!i&&!!c&&i.state!=="unknown"&&i.state!=="unavailable"&&c.state!=="unknown"&&c.state!=="unavailable",u=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!o&&!l&&!d&&!u)return"";let y="";if(l){let $=l.state==="on",h=l.attributes.source==="presence_manager",b="rpc-badge-green",w="Schedule active",_="";$&&(h?(b="rpc-badge-blue",w="Away hold",_="\u{1F3C3}"):(b="rpc-badge-amber",w="Hold active",_="\u{1F512}")),y=`
      <button class="rpc-hold-badge ${b}"
              data-hold-action="${h?"tooltip":"toggle"}"
              aria-label="${x(w)}">
        ${r.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${_} ${w}`}
      </button>
      ${r.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let f="";if(u){let $=Oe(p.state,e.language);$&&(f=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${$}</span>
        </div>
      `)}let m="",k=a.presence_entities??[];if(k.length>0){let $=k.map(v=>{let h=e.states[v];if(!h)return"";let b=h.state==="home",w=h.attributes.friendly_name??v,_=x(w.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${b?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${_}
        <span class="rpc-presence-label">${b?"home":"away"}</span>
      </span>`}).join("");$&&(m=`<div class="rpc-presence-row">${$}</div>`)}let T="";if(d){let $=parseInt(i.state,10),v=parseInt(c.state,10);if(!isNaN($)&&!isNaN(v)){let h=`${$} opportunit${$!==1?"ies":"y"} this week`,b=`${v}% utilised`;T=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${h} \xB7 ${b}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${o?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${Be(o.state,e.language)}</span>
            </div>`:""}
          ${f}
        </div>
        ${y}
      </div>
      ${m}
      ${T}
    </div>
  `}var xe={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"#e5e7eb"};function Fe(e,a){return e.toLocaleDateString(a,{month:"short",day:"numeric"})}function $e(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function we(e,a,t,n="en-US"){let c=new Map;for(let v of e)c.set(v.date,v);let p=new Date,d=[],u=new Date(p);u.setDate(p.getDate()-(a-1));let y=(u.getDay()+6)%7;u.setDate(u.getDate()-y);let f=Math.ceil((a+y)/7);for(let v=0;v<f;v++)for(let h=0;h<7;h++){let b=new Date(u);if(b.setDate(u.getDate()+v*7+h),b>p)continue;let w=$e(b);d.push({date:b,summary:c.get(w)??null,col:h,row:v})}let m=7*23-3,k=18+f*23-3+4,T=["Mo","Tu","We","Th","Fr","Sa","Su"],$=`<svg viewBox="0 0 ${m} ${k}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let v=0;v<7;v++){let h=v*23+10;$+=`<text x="${h}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary, #9ca3af)" font-family="inherit">${T[v]}</text>`}for(let v of d){let h=v.col*23,b=18+v.row*23,w=v.summary,_=w?.result??"none",C=xe[_]??xe.none,E=w?.total??0,g=Fe(v.date,n);if(E===0?g+=": no missions":E===1?g+=`: 1 mission, ${_}`:g+=`: ${E} missions, ${_}`,$+=`<g role="gridcell" aria-label="${g}" data-date="${$e(v.date)}" data-result="${_}" data-total="${E}" style="cursor:pointer">`,$+=`<rect x="${h-2}" y="${b-2}" width="24" height="24" fill="transparent" rx="3"/>`,$+=`<rect x="${h}" y="${b}" width="20" height="20" fill="${C}" rx="3"/>`,E>1){let R=Math.min(E,3);for(let D=0;D<R;D++){let I=h+20-4-D*5,B=b+20-3;$+=`<circle cx="${I}" cy="${B}" r="1.5" fill="rgba(255,255,255,0.8)"/>`}}$+="</g>"}return $+="</svg>",$}function Se(e){return!e||e.length===0?[]:e.every(t=>t<=4)?e.map(t=>t*25):e}function ke(e){return e<=4?e*25:e}function Ce(e,a){if(!e||e.length===0)return"";let t=7,n=e.length<=t?[...e]:Array.from({length:t},(u,y)=>e[Math.round(y/(t-1)*(e.length-1))]),r=Math.max(...n,1),s=n.length,o=6,l=2,i=s*o+(s-1)*l,c=16,p=a>=60?"var(--rpc-green)":a>=40?"var(--rpc-amber)":"var(--rpc-red)",d="";for(let u=0;u<s;u++){let y=u*(o+l),f=Math.max(2,Math.round(n[u]/r*c)),m=c-f;d+=`<rect x="${y}" y="${m}" width="${o}" height="${f}" fill="${p}" rx="1"/>`}return`<svg width="${i}" height="${c}" viewBox="0 0 ${i} ${c}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`}function Te(e=4){let o=18+e*23-3+4,l=["Mo","Tu","We","Th","Fr","Sa","Su"],i=`<svg viewBox="0 0 158 ${o}" xmlns="http://www.w3.org/2000/svg">`;i+="<style>@keyframes rpc-pulse{0%,100%{opacity:.4}50%{opacity:.8}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let c=0;c<7;c++){let p=c*23+10;i+=`<text x="${p}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary,#9ca3af)" font-family="inherit">${l[c]}</text>`}for(let c=0;c<e;c++)for(let p=0;p<7;p++){let d=p*23,u=18+c*23;i+=`<rect x="${d}" y="${u}" width="20" height="20" fill="#e5e7eb" rx="3" class="rpc-skel" style="animation-delay:${(c*7+p)*30}ms"/>`}return i+="</svg>",i}function Re(e,a,t,n){if(a.show_alerts===!1)return"";let r=n,s=[],o=e.states[`sensor.${r}_last_error_code`];if(o&&o.state!=="0"&&o.state!==""&&o.state!=="unavailable"){let p=x(o.attributes.description??"Robot error"),d=x(o.attributes.action??"");s.push({priority:1,text:`Error: ${p}`,subtext:d||void 0})}let l=e.states[`binary_sensor.${r}_maintenance_due`];if(l&&l.state==="on"){let p=e.states[`sensor.${r}_readiness`]?.state??"",d="Maintenance due";p==="bin_full"||p==="Bin Full"?d="Bin full \u2014 empty to continue":p&&p!=="Ready"&&p!=="unknown"&&p!=="unavailable"&&(d="Robot not ready \u2014 check the app"),s.push({priority:2,text:d})}if(t.hasWearRate){let p=e.states[`sensor.${r}_filter_wear_rate`],d=e.states[`sensor.${r}_filter_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let f=d.attributes.threshold_hours,m=parseFloat(p.state)/(f/90);m>1.5&&s.push({priority:3,text:`Filter wearing ${m.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup."})}let u=e.states[`sensor.${r}_brush_wear_rate`],y=e.states[`sensor.${r}_brush_remaining_hours`];if(u&&u.state!=="unknown"&&u.state!=="unavailable"&&y){let f=y.attributes.threshold_hours,m=parseFloat(u.state)/(f/90);m>1.5&&s.push({priority:4,text:`Brush wearing ${m.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles."})}}let i=e.states[`sensor.${r}_nav_quality`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"){let p=parseInt(i.state,10);!isNaN(p)&&p<60&&s.push({priority:5,text:`Navigation quality low (${p}/100)`,subtext:"Check lighting or move obstacles in the cleaning area."})}if(t.hasConsecutiveSkips){let p=e.states[`binary_sensor.${r}_consecutive_clean_skips`];if(p&&p.state==="on"){let d=p.attributes.skip_count??null,u=d!==null?`Robot blocked from cleaning ${d} consecutive time${d!==1?"s":""}`:"Robot blocked from cleaning repeatedly";s.push({priority:6,text:u,subtext:"Check blocking sensors or robot placement."})}}if(t.hasWifiFloor){let p=e.states[`sensor.${r}_recent_wifi_floor`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"){let d=parseInt(p.state,10),u=isNaN(d)?NaN:ke(d);!isNaN(u)&&u<50&&s.push({priority:7,text:`Wi-Fi signal dropped to ${u}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender."})}}if(s.length===0)return"";let c=s.sort((p,d)=>p.priority-d.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${c.text}</div>
          ${c.subtext?`<div class="rpc-alert-sub">${c.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function se(e,a){return a?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function Ee(e,a,t,n,r,s){if(a.show_history===!1)return"";let o=n,l=a.history_days??28,i=a.area_unit??"auto",c=i==="m2"||i==="auto"&&s,p=e.states[`sensor.${o}_clean_streak`],d=e.states[`sensor.${o}_completion_rate_30d`],u=p?parseInt(p.state,10):0,y=d?parseInt(d.state,10):NaN,f="",m=[];if(u>0&&m.push(`\u{1F525} ${u}-day streak`),isNaN(y)||m.push(`${y}% completion rate`),t.hasCleaningSpeedTrend){let b=e.states[`sensor.${o}_cleaning_speed_trend`]?.state;b==="declining"?m.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):b==="improving"&&m.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}m.length&&(f=`<div class="rpc-history-summary">${m.map((h,b)=>b===0?h:`<span class="rpc-summary-sep">\xB7</span>${h}`).join("")}</div>`);let k="";r.loading&&!r.data?k=Te(Math.ceil(l/7)):r.error?k=`<div class="rpc-history-error">${x(r.error)}</div>`:r.data&&(k=we(r.data,l,i,e.language),r.data.length<l&&(k+=`<div class="rpc-history-partial">Showing ${r.data.length} of ${l} days \u2014 full history builds over time</div>`));let T="";if(t.hasProblemZone){let h=e.states[`sensor.${o}_problem_zone`],b=e.states[`sensor.${o}_stuck_count_30d`];if(h&&h.state!=="unknown"&&h.state!=="unavailable"){let w=b?parseInt(b.state,10):0;w>0&&(T=`<div class="rpc-problem-zone">\u26A0 ${x(h.state)} \u2014 stuck ${w}\xD7 in 30 days</div>`)}}let $="";if(r.openDay){let b=new Date(r.openDay+"T00:00:00").toLocaleDateString(e.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),w=r.dayMissions,_=r.openDaySummary,C="";if(w===null)C="";else if(_&&_.total===0)C='<div class="rpc-day-empty">No missions this day</div>';else if(w.length>0)C=w.map(g=>{let R=g.result==="completed"?"\u2713":"\u2717",D=g.result==="completed"?"rpc-day-ok":"rpc-day-err",I=new Date(g.started_at).toLocaleTimeString(e.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),B=g.area_sqft!==null?se(g.area_sqft,c):"\u2014",ae=g.zones?.map(L=>x(L)).join(" \xB7 ")??"",U=a.show_dirt_events&&g.dirt_events!=null&&g.dirt_events>0?`${g.dirt_events} dirt event${g.dirt_events!==1?"s":""}`:"",j=[ae,U].filter(Boolean).join(" \xB7 "),N="";if(g.wifi_signal&&g.wifi_signal.length>0){let L=Se(g.wifi_signal),Z=Math.min(...L),Y=Ce(L,Z);N=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${Z}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${Y}<span>${Z}% min</span></div>`}return`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${D}">${R}</span>
            <span class="rpc-day-time">${I}</span>
            <span class="rpc-day-dur">${g.duration_min} min</span>
            <span class="rpc-day-area">${B}</span>
            ${j?`<div class="rpc-day-zones">${j}</div>`:""}
            ${N}
          </div>`}).join("");else if(_&&_.total>0){let g=_.area_sqft!==null?se(_.area_sqft,c):null;C=`
        <div class="rpc-day-aggregate">
          <div>${_.total} mission${_.total>1?"s":""} \xB7 ${x(_.result)}
            ${g?` \xB7 ${g} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let E=_?.total??0;$=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${x(b)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${E>0&&w&&w.length>0?`<div class="rpc-day-count">${E} mission${E>1?"s":""}</div>`:""}
        ${C}
      </div>
    `}let v="";if(a.show_lifetime!==!1){let h=e.states[`sensor.${o}_lifetime_missions`],b=e.states[`sensor.${o}_lifetime_area`],w=e.states[`sensor.${o}_lifetime_time`];if(h&&b&&w){let _=parseInt(h.state,10),C=parseInt(w.state,10),E=parseFloat(b.state),g=isNaN(E)?null:se(E,c),R=r.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(_)?"":`<span>${_.toLocaleString()} missions</span>`}
          ${g?`<span>${g}</span>`:""}
          ${isNaN(C)?"":`<span>${C.toLocaleString()} h</span>`}
        </div>`:"";v=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${r.lifetimeExpanded}">
          Lifetime ${r.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${R}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${l} DAYS</div>
      ${f}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${k}
      </div>
      ${T}
      ${$}
      ${v}
    </div>
  `}var ze=`
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
  .rpc-heatmap-wrap svg { width: 100%; height: auto; display: block; }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }
`,re=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=t=>{if(!t.composedPath().includes(this)){let r=!1;this.openPopover!==null&&(this.openPopover=null,r=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,r=!0),r&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}setConfig(t){let n=t.entities&&t.entities.length>0?t.entities:[t.entity];if(!n[0])throw new Error("roomba-plus-card: entity is required");let r=this.activeRobot,s=n.includes(r)?r:n[0],o=s!==r;this.config=t,this.activeRobot=s,this.robotName=s.replace("vacuum.",""),o&&this.resetRobotState(),this.root.innerHTML=`<style>${ze}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(t){let n=this.relevantEntityIds(),r=!this._hass||n.some(c=>t.states[c]?.state!==this._hass.states[c]?.state||t.states[c]?.last_changed!==this._hass.states[c]?.last_changed),s=this._hass;this._hass=t;let o=t.states[`select.${this.robotName}_cleaning_passes`];o&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=ue[o.state]??"Auto");let l=`binary_sensor.${this.robotName}_mission_active`,i=t.states[l]?.state??"";if(i)this.prevMissionActive==="on"&&i==="off"&&this.loadHistory(),this.prevMissionActive=i;else{let c=t.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&c==="docked"&&this.loadHistory(),this.prevVacuumState=c}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new G(t,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(t),(!s||r)&&this.render()}relevantEntityIds(){let t=this.robotName;return[this.config.entity,`sensor.${t}_last_error_code`,`sensor.${t}_mission_phase`,`binary_sensor.${t}_mission_active`,`binary_sensor.${t}_maintenance_due`,`binary_sensor.${t}_schedule_hold_active`,`sensor.${t}_next_clean`,`sensor.${t}_filter_remaining_hours`,`sensor.${t}_brush_remaining_hours`,`sensor.${t}_mop_tank_level`,`sensor.${t}_clean_base_status`,`sensor.${t}_nav_quality`,`sensor.${t}_next_likely_clean_window`,`sensor.${t}_presence_clean_opportunities_7d`,`sensor.${t}_presence_clean_utilisation_7d`,`sensor.${t}_cleaning_passes`,`select.${t}_cleaning_passes`,`select.${t}_smart_zone_select`,`select.${t}_zone_select`,`sensor.${t}_clean_streak`,`sensor.${t}_completion_rate_30d`,`sensor.${t}_lifetime_missions`,`sensor.${t}_lifetime_area`,`sensor.${t}_lifetime_time`,`sensor.${t}_battery_capacity_retention`,`sensor.${t}_recent_wifi_floor`,`sensor.${t}_recent_coverage_pct`,`sensor.${t}_estimated_battery_eol`,`sensor.${t}_cleaning_speed_trend`,`binary_sensor.${t}_consecutive_clean_skips`,`sensor.${t}_missions_last_30d`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}async switchRobot(t){if(t===this.activeRobot)return;this.activeRobot=t,this.robotName=t.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new G(this._hass,this.config,t),this.loadHistory()),this.render();let n=this.config.robot_selector_helper;if(n&&this._hass.states[n]){let r=n.split(".")[0],s=r==="input_select"?"select_option":"set_value",o=r==="input_select"?{entity_id:n,option:t}:{entity_id:n,value:t};try{await this._hass.callService(r,s,o)}catch(l){console.warn("roomba-plus-card: robot_selector_helper write failed",l)}}}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let t=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let n=this.config.history_days??28,r=await this.apiClient.fetchSummary(n),s=await this.apiClient.fetchRecords(n);if(s.length>0){let o=new Map;for(let l of s){let i=l.started_at.slice(0,10);o.has(i)||o.set(i,[]),o.get(i).push(l)}for(let l of r){let i=o.get(l.date);i&&(l.missions=i.sort((c,p)=>c.started_at.localeCompare(p.started_at)))}}this.missionData=r,this.firstRecord=s.length>0?s[s.length-1]:null,this.firstSummary=r.length>0?r[r.length-1]:null}catch(n){let r=n.message;this.historyError=r==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==t)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let t=X(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),n=this._hass.config?.unit_system?.length==="m",r=new Date,s=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`,l=(this.missionData?.find(d=>d.date===s)??null)?.total??null,i=Re(this._hass,this.config,t,this.robotName),c=i;i?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=i):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),c=this.lastAlertHtml);let p=`
      <style>${ze}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${ge({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:l,missionData:this.missionData,settingsPanelOpen:this.settingsPanelOpen})}
        ${me({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen})}
        ${ye(this._hass,this.config,t,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown})}
        ${_e(this._hass,this.config,t,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
        ${c}
        ${Ee(this._hass,this.config,t,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded},n)}
      </div>
    `;this.root.innerHTML=p,this.attachEventListeners()}renderRobotSelectorBar(){let t=this.entityList();return t.length<2?"":`<div class="rpc-robot-selector"><select class="rpc-robot-select" data-robot-select>${t.map(r=>{let s=this._hass.states[r]?.attributes?.friendly_name??r,o=r===this.activeRobot?" selected":"";return`<option value="${r}"${o}>${s}</option>`}).join("")}</select></div>`}attachEventListeners(){let t=this.root.querySelector(".rpc-card"),n=t.querySelector("[data-robot-select]");n&&n.addEventListener("change",s=>{s.stopPropagation(),this.switchRobot(s.target.value)}),t.querySelectorAll("[data-action]").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.handleAction(s.dataset.action)})}),t.querySelectorAll("[data-room]").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation();let l=s.dataset.room;this.selectedRooms.has(l)?this.selectedRooms.delete(l):this.selectedRooms.add(l),this.render()})}),t.querySelectorAll("[data-pass]").forEach(s=>{s.addEventListener("click",async o=>{o.stopPropagation();let l=s.dataset.pass,i=s.dataset.passOption;this.passes=l,this.render();let c=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[c]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:c,option:i})}catch{}finally{this.passSettingInFlight=!1}}})}),t.querySelectorAll("[data-bar]").forEach(s=>{let o=l=>{l.stopPropagation();let i=s.dataset.bar;this.openPopover=this.openPopover===i?null:i,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)};s.addEventListener("click",o),s.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),o(l))})}),t.querySelectorAll("[data-close]").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.openPopover=null,this.render()})}),t.querySelectorAll("[data-reset]").forEach(s=>{s.addEventListener("click",async o=>{o.stopPropagation();let l=s.dataset.reset,i=s.dataset.service;this.resetting=l,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",i,{entity_id:this.config.entity}),await new Promise(c=>setTimeout(c,800)),this.openPopover=null}catch{this.resetError=l}finally{this.resetting=null,this.render()}})}),t.querySelectorAll("[data-hold-action]").forEach(s=>{s.addEventListener("click",async o=>{if(o.stopPropagation(),s.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let l=`switch.${this.robotName}_schedule_hold`,i=this._hass.states[l]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",i?"turn_off":"turn_on",{entity_id:l})}finally{this.holdToggling=!1,this.render()}}})});let r=t.querySelector("[data-heatmap]");r&&r.addEventListener("click",s=>{s.stopPropagation();let o=s.target.closest("[data-date]");if(!o)return;let l=o.getAttribute("data-date");this.openDay===l?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=l,this.openDaySummary=this.missionData?.find(i=>i.date===l)??null,this.dayMissions=this.buildDayMissions(l)),this.render()}),t.querySelectorAll("[data-close-day]").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),t.querySelectorAll("[data-settings-toggle]").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),t.querySelectorAll("[data-switch-entity]").forEach(s=>{s.addEventListener("click",async o=>{o.stopPropagation();let l=s.dataset.switchEntity,i=this._hass.states[l]?.state==="on";try{await this._hass.callService("switch",i?"turn_off":"turn_on",{entity_id:l})}catch{}})}),t.querySelectorAll("[data-cycle-entity]").forEach(s=>{s.addEventListener("click",async o=>{o.stopPropagation();let l=s.dataset.cycleEntity,i=JSON.parse(s.dataset.cycleOptions??"[]"),c=s.dataset.cycleCurrent??"",p=i.indexOf(c),d=i.length>0?i[(p+1)%i.length]:null;if(d)try{await this._hass.callService("select","select_option",{entity_id:l,option:d})}catch{}})}),t.querySelectorAll("[data-lifetime-toggle]").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})})}buildDayMissions(t){let n=this.missionData?.find(r=>r.date===t);return!n||n.total===0?[]:n.missions&&n.missions.length>0?n.missions:[]}async handleAction(t){let{entity:n}=this.config,r=this.robotName;if(t==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let c=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${r}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:ee[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:n,room_name:c,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(t==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${r}_repeat_mission`})}catch{}return}let o={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"]}[t];if(!o)return;let[l,i]=o;if(this.loadingAction=t,this.render(),t==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(l,i,{entity_id:n})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(l,i,{entity_id:n})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let t=X(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),n=4;return t.hasZones&&this.config.show_rooms!==!1&&(n+=3),this.config.show_health!==!1&&(n+=2),this.config.show_schedule!==!1&&(n+=2),this.config.show_history!==!1&&(n+=4),n}static getConfigForm(){return{schema:[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",label:"Show room selector zone",selector:{boolean:{}}},{name:"show_settings",label:"Show settings panel",selector:{boolean:{}}},{name:"show_health",label:"Show health zone",selector:{boolean:{}}},{name:"show_schedule",label:"Show schedule & presence zone",selector:{boolean:{}}},{name:"show_alerts",label:"Show alerts zone",selector:{boolean:{}}},{name:"show_history",label:"Show history zone",selector:{boolean:{}}},{name:"show_lifetime",label:"Show lifetime stats",selector:{boolean:{}}},{name:"show_dirt_events",label:"Show dirt events in day detail",selector:{boolean:{}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",re);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
