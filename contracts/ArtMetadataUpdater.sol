// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArtMetadataUpdater {
    event CreatorContextUpdated(
        string indexed artId,
        string creatorContextURI,
        address updatedBy
    );
    
    event AwakeningURIUpdated(
        string indexed artId, 
        string awakeningURI,
        address updatedBy
    );
    
    event JourneysURIUpdated(
        string indexed artId,
        string journeysURI, 
        address updatedBy
    );

    function updateCreatorContextURI(string calldata artId, string calldata creatorContextURI) external {
        emit CreatorContextUpdated(artId, creatorContextURI, msg.sender);
    }

    function updateAwakeningURI(string calldata artId, string calldata awakeningURI) external {
        emit AwakeningURIUpdated(artId, awakeningURI, msg.sender);
    }

    function updateJourneysURI(string calldata artId, string calldata journeysURI) external {
        emit JourneysURIUpdated(artId, journeysURI, msg.sender);
    }
}