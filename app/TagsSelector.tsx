import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import makeAnimated from "react-select/animated";
import { Tag } from "./types";

interface Props {
  onSelect?: (items: Tag[]) => void;
  value?: Tag[] | null;
}

const TagsSelector: React.FC<Props> = ({ value, onSelect }) => {
  const [selectedTags, setSelectedTags] = useState(value || []);

  const tags = [
    {
      label: "Chess",
      options: [
        { value: "game:chess", label: "Chess" },
        { value: "game_mode:chess_bullet_1+0", label: "Bullet 1+0" },
        { value: "game_mode:chess_bbullet_2+1", label: "Bullet 2+1" },
        { value: "game_mode:chess_bblitz_3+2", label: "Blitz 3+2" },
        { value: "game_mode:chess_bblitz_5+0", label: "Blitz 5+0" },
        { value: "game_mode:chess_brapid_10+0", label: "Rapid 10+0" },
        { value: "game_mode:chess_brapid_10+5", label: "Rapid 10+5" },
        { value: "game_mode:chess_bclassical_30+0", label: "Classical 30+0" },
        { value: "game_mode:chess_bclassical_30+20", label: "Classical 30+20" },
        { value: "game_mode:chess_bblitz_3+0", label: "Blitz 3+0" },
        { value: "game_mode:chess_bblitz_5+3", label: "Blitz 5+3" },
        { value: "game_mode:chess_brapid_15+10", label: "Rapid 15+10" },
      ],
    },
    {
      label: "Tennis",
      options: [
        { value: "game:tennis", label: "Tennis" },
        { value: "game_mode:tennis_singles", label: "Singles" },
        { value: "game_mode:tennis_doubles", label: "Doubles" },
        { value: "game_mode:tennis_mixed_doubles", label: "Mixed Doubles" },
      ],
    },
    {
      label: "Basketball",
      options: [
        { value: "game:basketball", label: "Basketball" },
        { value: "game_mode:basketball_3_on_3", label: "3-on-3" },
        { value: "game_mode:basketball_5_on_5", label: "5-on-5" },
      ],
    },
    {
      label: "Fortnite",
      options: [
        { value: "game:fortnite", label: "Fortnite" },
        { value: "game_mode:fortnite_duo", label: "Duo" },
        { value: "game_mode:fortnite_squad", label: "Squad" },
        { value: "game_mode:fortnite_creative", label: "Creative" },
        { value: "game_mode:fortnite_arena", label: "Arena" },
        { value: "game_mode:fortnite_team_rumble", label: "Team Rumble" },
        { value: "game_mode:fortnite_party_royale", label: "Party Royale" },
      ],
    },
    {
      label: "Dota 2",
      options: [
        { value: "game:dota2", label: "Dota 2" },
        { value: "game_mode:dota2_all_pick", label: "All Pick" },
        { value: "game_mode:dota2_captains_mode", label: "Captains Mode" },
        { value: "game_mode:dota2_ability_draft", label: "Ability Draft" },
        { value: "game_mode:dota2_turbo", label: "Turbo" },
        { value: "game_mode:dota2_random_draft", label: "Random Draft" },
        { value: "game_mode:dota2_single_draft", label: "Single Draft" },
        { value: "game_mode:dota2_all_random", label: "All Random" },
        {
          value: "game_mode:dota2_all_random_death_match",
          label: "All Random Death Match",
        },
        { value: "game_mode:dota2_1v1_mid", label: "1v1 Mid" },
      ],
    },
    {
      label: "Rocket League",
      options: [
        { value: "game:rocket_league", label: "Rocket League" },
        { value: "game_mode:rocket_league_soccar", label: "Soccar" },
        { value: "game_mode:rocket_league_hoops", label: "Hoops" },
        { value: "game_mode:rocket_league_snow_day", label: "Snow Day" },
        { value: "game_mode:rocket_league_rumble", label: "Rumble" },
      ],
    },
  ];

  const animatedComponents = makeAnimated();

  const handleChange = (selectedOptions: any) => {
    setSelectedTags(selectedOptions || []);
    onSelect && onSelect(selectedOptions || []);
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      background: "white",
      borderColor: "rgb(229, 231, 235)",
      borderRadius: "0.375rem",
      minHeight: "46px",
      fontSize: "1.125rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgb(147, 197, 253);" : "none",
      "&:hover": {
        borderColor: "rgb(229, 231, 235)",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      textAlign: "left",
    }),
    option: (provided: any, { data, isFocused, isSelected }: any) => {
      return {
        ...provided,
        backgroundColor: isSelected
          ? "rgb(147, 197, 253)"
          : isFocused
          ? "rgb(229, 231, 235)"
          : "white",
        color: "black",
      };
    },
    placeholder: (provided: any) => {
      return {
        ...provided,
        textAlign: "start",
        color: "rgb(156 163 175);",
      };
    },
  };

  return (
    <CreatableSelect
      components={animatedComponents}
      isMulti
      options={tags}
      value={selectedTags}
      onChange={handleChange}
      placeholder="Select or create a tags..."
      isClearable
      isSearchable
      styles={customStyles}
    />
  );
};

export default TagsSelector;
