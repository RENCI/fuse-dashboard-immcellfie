import React, { useRef, useEffect } from "react";
import Builder from "escher";
import { json } from "d3-fetch";
import "./escher-wrapper.css";

export const EscherWrapper = () => {
  const div = useRef();
  
  const draw = () => {
    json("/data/escher/iJO1366.json").then(model => {  
      const options1 = {
        menu: 'all',
        use_3d_transform: true,
        enable_editing: true,
        enable_keys: true,
        first_load_callback,
        fill_screen: false,
        never_ask_before_quit: true,
        show_gene_reaction_rules: false,
        full_screen_button: true,
        reaction_data: { PPS: 20, THZPSN3: 20 },
        metabolite_data: { atp_c: 20 },
        // reaction_no_data_size: 25,
        // metabolite_no_data_size: 25,
        canvas_size_and_loc: {
          x: -900,
          y: -900,
          width: 2000,
          height: 2000
        }
      };
  
      Builder(null, model, null, div.current, options1)
    }).catch(error => {
      console.log(error);
    });
  }

  const first_load_callback = builder => {
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

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="wrapperDiv" ref={ div }></div>
  );
};
