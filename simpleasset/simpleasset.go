package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"github.com/hyperledger/fabic-contract-api-go/contractapi"
)

type SmartContract struct {
	conractapi.Contract 
}

type Asset struct {
	Key string `json:"key"`
	Value string `json:"value"`
}

func (s *SmartContract) Get(ctx contractapi.TransactionContextInterface, key string) error {
	assetAsBytes, err := ctx.GetStub().GetState(carNumber)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from SimpleAsset world state. %s", err.Error())
	}

	if assetAsBytes == nil {
		return nil, fmt.Errorf("Asset Key %s does not exist", key)
	}

	asset :=new(Asset)
	_ = json.Unmarshal(assetAsBytes, asset)

	return asset, nil
}

func (s *SmartContract) Put(ctx contractapi.TransactionContextInterface, key string, value float64) error {
	car, err := s.Get(ctx, key)

	if err != nil {
		return err
	}

	asset.Value = value
	assetAsBytes, _ := json.Marshal(asset)

	return ctx.GetStub().PutState(key, assetAsBytes)
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create SimpleAsset chaincode: %s", err.Error())
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err.Error())
	}
}