import React, { useRef, useEffect } from "react";
import Builder from "escher";
import { json } from "d3-fetch";
import "./escher-wrapper.css"; 

export const EscherWrapper = ({ map, reactionScores, onLoaded }) => {
  const div = useRef();
  const builder = useRef();

  const first_load_callback = escherBuilder => {
    builder.current = escherBuilder;
  };

  useEffect(() => {
    const options = {
      menu: 'all',
      scroll_behavior: 'zoom',
      use_3d_transform: false,
      enable_editing: false,
      enable_keys: true,
      enable_search: true,
      fill_screen: false,
      zoom_to_element: null,
      full_screen_button: true,
      starting_reaction: null,
      never_ask_before_quit: true,        
      show_gene_reaction_rules: false,
      hide_secondary_metabolites: false,
      hide_all_labels: false,
      first_load_callback
    };

    Builder(null, null, null, div.current, options);
  }, []);

  useEffect(() => {
    json(map).then(map => { 
      if (builder.current) {
        builder.current.load_map(map);

        onLoaded();
      }
    }).catch(error => {
      console.log(error);
    });
  }, [map, onLoaded]);

  useEffect(() => {
    if (builder.current) {
      builder.current.set_reaction_data(reactionScores);
    }
  }, [reactionScores]);

  return (       
    <div className="wrapperDiv" ref={ div }></div>
  );
};
