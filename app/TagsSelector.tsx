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
        { value: "chess:chess_standard", label: "[Chess] Standard" },
        { value: "chess:chess_blitz", label: "[Chess] Blitz" },
        { value: "chess:chess_bullet", label: "[Chess] Bullet" },
        { value: "chess:chess_rapid", label: "[Chess] Rapid" },
      ],
    },
    {
      label: "Football",
      options: [
        { value: "football:football_standard", label: "[Football] Standard" },
        { value: "football:football_futsal", label: "[Football] Futsal" },
        { value: "football:football_street", label: "[Football] Street" },
        { value: "football:football_beach", label: "[Football] Beach" },
      ],
    },
    {
      label: "CS:GO",
      options: [
        { value: "csgo:standard", label: "[CS:GO] Standard" },
        { value: "csgo:deathmatch", label: "[CS:GO] Deathmatch" },
        { value: "csgo:headshot", label: "[CS:GO] Headshot" },
        { value: "csgo:awp_only", label: "[CS:GO] AWP Only" },
      ],
    },
    {
      label: "Dota 2",
      options: [
        { value: "dota2:standard", label: "[Dota 2] Standard" },
        { value: "dota2:all_random", label: "[Dota 2] All Random" },
        { value: "dota2:mid_only", label: "[Dota 2] Mid only" },
        { value: "dota2:ranked", label: "[Dota 2] Ranked" },
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
