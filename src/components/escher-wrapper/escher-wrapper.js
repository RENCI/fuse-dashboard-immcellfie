import React, { useRef, useEffect } from "react";
import Builder from "escher";
import { json } from "d3-fetch";
import "./escher-wrapper.css";

export const EscherWrapper = () => {
  const div = useRef();

  const first_load_callback_old = builder => {
    // Draw the reaction
    const draw = (bigg_id, loc, rot) => {
      builder.map.new_reaction_from_scratch(bigg_id, loc, rot);
      /*
      builder.map.new_reaction_for_metabolite(
        bigg_id, Object.keys(builder.map.get_selected_nodes())[0], rot
      );
      */
    };

    draw('ENO', { x: 0, y: 200 }, 90);
    draw('PPS', { x: -200, y: 0 }, 180);
    draw('CYTBD2pp', { x: 200, y: 0 }, 0);
    draw('PGI', { x: 0, y: -200 }, -90);
    draw('NADTRHD', { x: 200, y: -200 }, -35);
    draw('XYLabcpp', { x: -200, y: -200 }, -135);
    draw('THZPSN3', { x: 600, y: 200 }, 45);
    draw('PPA2', { x: -200, y: 200 }, 135);

    builder.map.new_reaction_from_scratch(
      'Ec_biomass_iJO1366_WT_53p95M',
      { x: 0, y: 1300 }, 
      90
    );
  
    // And zoom the map to focus on that reaction
    builder.map.zoom_extent_canvas();
  
    // After building a reaction, Escher selects the newest
    // metabolite. Unselect it like this.
    builder.map.select_none();
  };

  const first_load_callback = builder => {
    json("/data/escher/Amino_Acids_Metabolism.json").then(map => { 
      builder.load_map(map);
    }).catch(error => {
      console.log(error);
    });
  };
  
  const draw = () => {     
    const options = {
      menu: 'all',
      scroll_behavior: 'zoom',
      use_3d_transform: false,
      enable_editing: false,
      enable_keys: true,
      enable_search: false,
      fill_screen: false,
      zoom_to_element: null,
      full_screen_button: true,
      starting_reaction: null,
      never_ask_before_quit: true,        
      show_gene_reaction_rules: false,
      hide_secondary_metabolites: false,
      show_gene_reaction_rules: false,
      hide_all_labels: false,    
      first_load_callback
    };

    Builder(null, null, null, div.current, options)
  };

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="wrapperDiv" ref={ div }></div>
  );
};
